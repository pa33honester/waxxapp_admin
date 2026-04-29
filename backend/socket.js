//import model
const User = require("./server/user/user.model");
const Seller = require("./server/seller/seller.model");
const LiveSeller = require("./server/liveSeller/liveSeller.model");
const LiveSellingHistory = require("./server/liveSellingHistory/liveSellingHistory.model");
const LiveSellingView = require("./server/liveSellingView/liveSellingView.model");
const LiveChat = require("./server/liveChat/liveChat.model");
const Follower = require("./server/follower/follower.model");

//momemt
const moment = require("moment-timezone");

//mongoose
const mongoose = require("mongoose");

//private key
const admin = require("./util/privateKey");

// Whatnot-style system messages (SOLD / BID / GIVEAWAY_WIN / FOLLOW) in live chat
const { emitLiveSystemMessage } = require("./util/liveSystemMessage");

// Proxy / auto-bid engine — server-side counter bidding.
const { triggerAutoBid } = require("./server/autoBid/autoBid.controller");

// Bundles multiple wins from one seller into a single pending-payment Order.
const { findOrCreatePendingOrderForSeller } = require("./util/orderAggregator");

io.on("connect", async (socket) => {
  console.log("Socket Connection done: ", socket.id);
  console.log("socket.handshake.query: ", socket.handshake.query);

  const { liveRoom } = socket.handshake.query;
  const id = liveRoom && liveRoom.split(":")[1];
  console.log("Socket Connection with id:     ", id);

  if (!socket.rooms.has(liveRoom)) {
    socket.join(liveRoom);
    console.log(`Socket joined room: ${liveRoom}`);
  } else {
    console.log(`User ${id} is already in room: ${liveRoom}, skipping rejoin.`);
  }

  socket.on("liveRoomConnect", async (data) => {
    try {
      console.log("liveRoomConnect connected: ", data);

      const parsedData = JSON.parse(data);
      console.log("liveRoomConnect connected (parsed): ", parsedData);

      // Comment / view / addView / lessView all broadcast to the
      // "liveSellerRoom:<id>" room. The host's liveRoomConnect previously
      // joined just "<id>" (no prefix), which meant the host never
      // received comments — viewers saw chat, the seller didn't. Join
      // the prefixed room so the host is part of the same broadcast set.
      const sellerRoom = "liveSellerRoom:" + parsedData.liveSellingHistoryId;

      const sockets = await io.in(liveRoom).fetchSockets();
      console.log("sockets liveRoomConnect: ", sockets.length);

      if (sockets.length > 0) {
        sockets.forEach((socket) => {
          if (socket.rooms.has(sellerRoom)) {
            console.log(`[joinLiveRoom] User ${socket.id} is already in room: ${sellerRoom}`);
            return; // Do not rejoin
          }

          socket.rooms.forEach((room) => {
            if (room !== liveRoom) {
              console.log(`Leaving old room: ${room}`);
              socket.leave(room);
            }
          });

          socket.join(sellerRoom);

          console.log(`Joined new room: ${sellerRoom}`);
          console.log("Updated Rooms After Joined new room:", Array.from(socket.rooms));
        });

        io.in(sellerRoom).emit("liveRoomConnect", data);
      }
    } catch (err) {
      console.error(":x: Error in liveRoomConnect handler:", err.message, err);
      socket.emit("error", { event: "liveRoomConnect", message: err.message });
    }
  });

  socket.on("fetchLiveBroadcastDetails", async (payload) => {
    try {
      const parsedPayload = JSON.parse(payload);
      const { liveHistoryId, liveUserObjId, userId } = parsedPayload;

      console.log("Data received in fetchLiveBroadcastDetails:", parsedPayload);

      const targetSocket = io.sockets.sockets.get(socket.id);

      const [liveUserInfo, auctionBids] = await Promise.all([
        LiveSeller.findOne({ liveSellingHistoryId: new mongoose.Types.ObjectId(liveHistoryId) }),
        AuctionBid.findOne({ liveHistoryId: new mongoose.Types.ObjectId(liveHistoryId) })
          .sort({ currentBid: -1 })
          .populate("userId", "firstName lastName image"),
      ]);

      if (!liveUserInfo) {
        console.warn("No live user info found for given IDs.");
        targetSocket.emit("liveSessionInfo", "The live stream has ended. Disconnecting...");
        return;
      }

      // Per-viewer follow flag — gated on userId being a valid id, so the
      // FollowPill on the live page renders in its real state instead of
      // always defaulting to "Follow". The HTTP endpoints already project
      // this; the socket fetch is the path the live page actually uses on
      // entry, so it needs to project it too.
      let isFollow = false;
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        const follower = await Follower.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          sellerId: liveUserInfo.sellerId,
        }).lean();
        isFollow = !!follower;
      }

      const productsWithRemainingTime = liveUserInfo.selectedProducts
        .filter((product) => product.hasAuctionStarted) // Filter out products where auction hasn't started
        .map((product) => {
          let auctionRemainingTime = Math.round((new Date(product?.auctionEndTime).getTime() - new Date().getTime()) / 1000);
          auctionRemainingTime = auctionRemainingTime > 0 ? auctionRemainingTime : 0; // Prevent negative remaining time

          return auctionRemainingTime;
        });

      const totalRemainingTime =
        productsWithRemainingTime.length > 0
          ? productsWithRemainingTime.reduce((total, time) => total + time, 0) // Sum up the remaining times of all valid products
          : 0; // If no products have started, set total time to 0

      const highestBid = auctionBids;
      const currentHighestBid = highestBid ? highestBid.currentBid : 0;
      const currentHighestBidder = highestBid ? highestBid.userId : null;

      const responseData = {
        ...liveUserInfo.toObject(),
        currentHighestBid,
        currentHighestBidder,
        totalRemainingTime,
        isFollow,
      };

      if (targetSocket) {
        console.log("Target socket exists, emitting...", responseData);
        targetSocket.emit("liveSessionInfo", responseData);
      } else {
        console.log("Target socket not found.");
      }
    } catch (err) {
      console.error("Error in fetchLiveBroadcastDetails:", err);
    }
  });

  socket.on("addView", async (data) => {
    console.log("data in addView:  ", data);

    const dataOfaddView = JSON.parse(data);
    console.log("parsed data in addView:  ", dataOfaddView);

    // const baseRoom = socket.handshake.query.liveRoom; // e.g. 'liveRoom:userId'
    // const sellerRoom = "liveSellerRoom:" + dataOfaddView.liveSellingHistoryId;

    // const sockets = await io.in(baseRoom).fetchSockets(); // all sockets for same userId

    // for (const s of sockets) {
    //   if (!s.rooms.has(sellerRoom)) {
    //     s.join(sellerRoom);
    //     console.log(`[addView] joined ${sellerRoom} for socket ${s.id}`);
    //   } else {
    //     console.log(`[addView] already in ${sellerRoom} for socket ${s.id}`);
    //   }
    // }

    if (!socket.rooms.has("liveSellerRoom:" + dataOfaddView.liveSellingHistoryId)) {
      socket.join("liveSellerRoom:" + dataOfaddView.liveSellingHistoryId);
      console.log(`[addView] joined room: ${dataOfaddView.liveSellingHistoryId}`);
    } else {
      console.log(`[addView] is already in room: ${dataOfaddView.liveSellingHistoryId}`);
    }

    const user = await User.findById(dataOfaddView.userId);
    const liveSeller = await LiveSeller.findOne({ liveSellingHistoryId: dataOfaddView.liveSellingHistoryId });

    if (user && liveSeller) {
      const existLiveSellingView = await LiveSellingView.findOne({
        userId: dataOfaddView.userId,
        liveSellingHistoryId: dataOfaddView.liveSellingHistoryId,
      });
      console.log("existLiveSellingView in user and liveSeller (addView):  ", existLiveSellingView);

      if (!existLiveSellingView) {
        const liveSellingView = new LiveSellingView();
        liveSellingView.userId = dataOfaddView.userId;
        liveSellingView.liveSellingHistoryId = dataOfaddView.liveSellingHistoryId;
        liveSellingView.name = user.firstName;
        liveSellingView.image = user.image;
        await liveSellingView.save();

        console.log("new liveSellingView in user and liveSeller (addView): ", liveSellingView);
      }
    }

    const liveSellingView = await LiveSellingView.find({ liveSellingHistoryId: dataOfaddView.liveSellingHistoryId });
    console.log("liveSellingView in addView: ", liveSellingView.length);

    if (liveSeller) {
      liveSeller.view = liveSellingView.length;
      await liveSeller.save();
    }

    const xyz = io.sockets.adapter.rooms.get("liveSellerRoom:" + dataOfaddView.liveSellingHistoryId);
    console.log("addView sockets ====================================: ", xyz);

    io.in("liveSellerRoom:" + dataOfaddView.liveSellingHistoryId).emit("addView", liveSellingView.length);

    // Send the running like + share totals straight to the joiner so late
    // entrants don't see a stale "0" until the next tap. Targeted emit
    // (not the whole room) — existing viewers already have both counts.
    try {
      const lh = await LiveSellingHistory.findById(dataOfaddView.liveSellingHistoryId).select(
        "likeCount shareCount"
      );
      socket.emit("liveLikeCount", lh?.likeCount ?? 0);
      socket.emit("liveShareCount", lh?.shareCount ?? 0);
    } catch (err) {
      console.error("addView likeCount/shareCount seed error:", err.message);
    }
  });

  socket.on("lessView", async (data) => {
    console.log("data in lessView:  ", data);

    const dataOflessView = JSON.parse(data);
    console.log("parsed data in lessView:  ", dataOflessView);

    const sellerRoom = "liveSellerRoom:" + dataOflessView.liveSellingHistoryId;

    if (socket.rooms.has(sellerRoom)) {
      socket.leave(sellerRoom);
      console.log(`[lessView] left room: ${dataOflessView.liveSellingHistoryId}`);
    } else {
      console.log(`[lessView] was not in room: ${dataOflessView.liveSellingHistoryId}`);
    }

    const existLiveSellingView = await LiveSellingView.findOne({
      userId: dataOflessView.userId,
      liveSellingHistoryId: dataOflessView.liveSellingHistoryId,
    });

    if (existLiveSellingView) {
      console.log("existLiveSellingView deleted in lessView for that liveHistoryId");
      await existLiveSellingView.deleteOne();
    }

    const liveSellingView = await LiveSellingView.find({ liveSellingHistoryId: dataOflessView.liveSellingHistoryId });
    console.log("liveSellingView in lessView:  ", liveSellingView.length);

    const liveSeller = await LiveSeller.findOne({ liveSellingHistoryId: dataOflessView.liveSellingHistoryId });
    if (liveSeller) {
      liveSeller.view = liveSellingView.length;
      await liveSeller.save();
    }

    const xyz = io.sockets.adapter.rooms.get("liveSellerRoom:" + dataOflessView.liveSellingHistoryId);
    console.log("lessview sockets ====================================: ", xyz);

    io.in("liveSellerRoom:" + dataOflessView.liveSellingHistoryId).emit("lessView", liveSellingView.length);
  });

  socket.on("comment", async (data) => {
    console.log("data in comment: ", data);

    const dataOfComment = JSON.parse(data);
    console.log("parsed data in comment: ", dataOfComment);

    if (!socket.rooms.has("liveSellerRoom:" + dataOfComment.liveSellingHistoryId)) {
      socket.join("liveSellerRoom:" + dataOfComment.liveSellingHistoryId);
      console.log(`[comment] joined room: ${dataOfComment.liveSellingHistoryId}`);
    } else {
      console.log(`[comment] is already in room: ${dataOfComment.liveSellingHistoryId}`);
    }

    const liveSellingHistory = await LiveSellingHistory.findById(dataOfComment.liveSellingHistoryId);
    if (liveSellingHistory) {
      liveSellingHistory.comment += 1;
      await liveSellingHistory.save();
    }

    const abc = io.sockets.adapter.rooms.get("liveSellerRoom:" + dataOfComment.liveSellingHistoryId);
    console.log("comment sockets liveSellingHistoryId ====================================: ", abc);

    io.in("liveSellerRoom:" + dataOfComment.liveSellingHistoryId).emit("comment", data);

    // Persist the chat-comment so late-joiners can replay the backlog via
    // GET /liveSeller/chatHistory/:id. Fire-and-forget — the broadcast
    // above must not be blocked on the insert, and a write failure is
    // recoverable (worst case: that one comment doesn't show up in the
    // replay; the live transmission was already correct).
    LiveChat.create({
      liveSellingHistoryId: dataOfComment.liveSellingHistoryId,
      userId: dataOfComment.userId || dataOfComment.loginUserId || null,
      userName: dataOfComment.userName || "",
      userImage: dataOfComment.userImage || "",
      commentText: dataOfComment.commentText || dataOfComment.comment || "",
      type: dataOfComment.type || "",
      systemType: dataOfComment.systemType || "",
    }).catch((err) => console.error("LiveChat.create error:", err.message));
  });

  // Buyer sends a heart from the live page. We bump the running count on
  // the LiveSellingHistory and broadcast the new total to the room so every
  // viewer sees the same number — same shape as `addView`.
  socket.on("liveLike", async (data) => {
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      const liveSellingHistoryId = parsed?.liveSellingHistoryId;
      if (!liveSellingHistoryId) return;

      const room = "liveSellerRoom:" + liveSellingHistoryId;
      if (!socket.rooms.has(room)) socket.join(room);

      const updated = await LiveSellingHistory.findByIdAndUpdate(
        liveSellingHistoryId,
        { $inc: { likeCount: 1 } },
        { new: true, projection: { likeCount: 1 } }
      );
      const total = updated?.likeCount ?? 0;

      io.in(room).emit("liveLikeCount", total);
    } catch (err) {
      console.error("liveLike socket error:", err.message);
    }
  });

  // Buyer toggles the heart off — decrement the running like total and
  // rebroadcast. Clamped at zero via a conditional update so a stray
  // unlike from a client whose local mirror drifted ahead of the server
  // can't pull the persisted total negative.
  socket.on("liveUnlike", async (data) => {
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      const liveSellingHistoryId = parsed?.liveSellingHistoryId;
      if (!liveSellingHistoryId) return;

      const room = "liveSellerRoom:" + liveSellingHistoryId;
      if (!socket.rooms.has(room)) socket.join(room);

      const updated = await LiveSellingHistory.findOneAndUpdate(
        { _id: liveSellingHistoryId, likeCount: { $gt: 0 } },
        { $inc: { likeCount: -1 } },
        { new: true, projection: { likeCount: 1 } }
      );
      // If the conditional matched nothing (likeCount was already 0),
      // re-read so the broadcast still carries the authoritative total.
      const total =
        updated?.likeCount ??
        (await LiveSellingHistory.findById(liveSellingHistoryId, { likeCount: 1 }))?.likeCount ??
        0;

      io.in(room).emit("liveLikeCount", total);
    } catch (err) {
      console.error("liveUnlike socket error:", err.message);
    }
  });

  // Anyone (host or buyer) shares the live. Bump the running count on
  // LiveSellingHistory and rebroadcast the new total to the room so every
  // open client — including the host's own seller dashboard — stays in
  // sync. Same shape as `liveLike`.
  socket.on("liveShare", async (data) => {
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      const liveSellingHistoryId = parsed?.liveSellingHistoryId;
      if (!liveSellingHistoryId) return;

      const room = "liveSellerRoom:" + liveSellingHistoryId;
      if (!socket.rooms.has(room)) socket.join(room);

      const updated = await LiveSellingHistory.findByIdAndUpdate(
        liveSellingHistoryId,
        { $inc: { shareCount: 1 } },
        { new: true, projection: { shareCount: 1 } }
      );
      const total = updated?.shareCount ?? 0;

      io.in(room).emit("liveShareCount", total);
    } catch (err) {
      console.error("liveShare socket error:", err.message);
    }
  });

  socket.on("endLiveSeller", async (data) => {
    console.log("data in endLiveSeller: ", data);

    const parsedData = await JSON.parse(data);
    io.in("liveSellerRoom:" + parsedData?.liveSellingHistoryId).emit("endLiveSeller", "end");

    const [seller, liveSellingHistory] = await Promise.all([Seller.findOne({ liveSellingHistoryId: parsedData?.liveSellingHistoryId }), LiveSellingHistory.findById(parsedData?.liveSellingHistoryId)]);

    console.log("liveSellingHistory in endLiveSeller: ", liveSellingHistory);

    if (seller) {
      if (seller.isLive) {
        seller.isLive = false;

        if (liveSellingHistory) {
          const endTime = moment().tz("Asia/Kolkata").format();
          const start = moment.tz(liveSellingHistory.startTime, "Asia/Kolkata");
          const end = moment.tz(endTime, "Asia/Kolkata");
          const duration = moment.utc(end.diff(start)).format("HH:mm:ss");

          liveSellingHistory.endTime = endTime;
          liveSellingHistory.duration = duration;
        }
      }

      await Promise.all([
        seller?.save(),
        liveSellingHistory?.save(),
        LiveSeller.deleteOne({ sellerId: seller._id }),
        LiveSellingView.deleteMany({ liveSellingHistoryId: parsedData?.liveSellingHistoryId }),
        AuctionBid.deleteMany({ liveHistoryId: parsedData?.liveSellingHistoryId }),
        Product.updateMany({ isSelect: true }, { $set: { isSelect: false } }),
      ]);

      const sockets = await io.in("liveSellerRoom:" + parsedData?.liveSellingHistoryId?.toString()).fetchSockets();
      sockets?.length ? io.socketsLeave("liveSellerRoom:" + parsedData?.liveSellingHistoryId?.toString()) : console.log("sockets not able to leave in endLiveSeller");
    }
  });

  //real-time auction system
  const AuctionBid = require("./server/auctionBid/auctionBid.model");
  const Product = require("./server/product/product.model");
  const Order = require("./server/order/order.model");

  const Bull = require("bull");
  const auctionQueue = new Bull("auction-queue", {
    redis: {
      host: "127.0.0.1",
      port: 6379,
      password: null,
    },
  });

  // ─── Auction socket handlers — DISABLED ─────────────────────────────────
  // The auction feature was removed front-to-back. All four handlers
  // (initiateAuction, placeBid, declareWinner, manageAuctionExpiration)
  // are kept here as no-ops so any straggler clients on old builds don't
  // see crashes — they just see their events silently dropped. Files
  // under server/auctionBid, server/autoBid, workers/auctionWorker, and
  // workers/manualAuctionWorker are also left on disk but no longer
  // mounted (see route.js + index.js).
  /*
  socket.on("initiateAuction", async (data) => {
    console.log("Received auction started event:", data);

    try {
      const { liveStreamerId, liveHistoryId, productId, productName, userId, minAuctionTime } = JSON.parse(data);
      console.log(`Auction started for product ${productName} (ID: ${productId}) in liveHistory: ${liveHistoryId}`);

      const liveStreamer = await LiveSeller.findOne({
        sellerId: liveStreamerId,
        liveSellingHistoryId: liveHistoryId,
        liveType: 2,
      }).select("_id selectedProducts");

      if (!liveStreamer) {
        console.warn("Invalid liveAuctionId or not a seller auction:", liveStreamerId);

        if (userId) {
          io.to(userId.toString()).emit("auctionError", { message: "Auction not found or not valid to start." });
        }
        return;
      }

      if (!socket.rooms.has("liveSellerRoom:" + liveHistoryId.toString())) {
        socket.join("liveSellerRoom:" + liveHistoryId.toString());
        console.log(`[initiateAuction] joined room: ${liveHistoryId.toString()}`);
      } else {
        console.log(`[initiateAuction] is already in room: ${liveHistoryId.toString()}`);
      }

      // const sockets = await io.in(liveRoom).fetchSockets();
      // sockets?.length ? sockets[0].join("liveSellerRoom:" + liveHistoryId.toString()) : console.log("sockets not able to emit");

      io.in("liveSellerRoom:" + liveHistoryId.toString()).emit("initiateAuction", data);

      const xyz = io.sockets.adapter.rooms.get("liveSellerRoom:" + liveHistoryId.toString());
      console.log("initiateAuction sockets ====================================: ", xyz);

      const endTime = new Date(Date.now() + minAuctionTime * 1000);
      const product = liveStreamer.selectedProducts.find((p) => p.productId.toString() === productId.toString());

      product.hasAuctionStarted = true;
      product.auctionEndTime = endTime;
      await liveStreamer.save();
    } catch (error) {
      console.error("initiateAuction error:", error);
    }
  });

  socket.on("placeBid", async (data) => {
    console.log("Received bid data:", data);

    try {
      const { liveStreamerId, liveHistoryId, productVendorId, productId, userId, amount, minAuctionTime } = JSON.parse(data);

      const liveStreamer = await LiveSeller.findOne({
        sellerId: liveStreamerId,
        liveSellingHistoryId: liveHistoryId,
        liveType: 2,
      }).select("_id selectedProducts");

      if (!liveStreamer) {
        console.warn("Invalid liveAuctionId or not a seller auction:", liveStreamerId);

        io.to(userId.toString()).emit("auctionError", { message: "Auction not found or not valid for bidding." });
        return;
      }

      if (!socket.rooms.has("liveSellerRoom:" + liveHistoryId.toString())) {
        socket.join("liveSellerRoom:" + liveHistoryId.toString());
        console.log(`[placeBid] joined room: ${liveHistoryId.toString()}`);
      } else {
        console.log(`[placeBid] is already in room: ${liveHistoryId.toString()}`);
      }

      // const sockets = await io.in(liveRoom).fetchSockets();
      // sockets?.length ? sockets[0].join("liveSellerRoom:" + liveHistoryId.toString()) : console.log("sockets not able to emit");

      const xyz = io.sockets.adapter.rooms.get("liveSellerRoom:" + liveHistoryId.toString());
      console.log("announceTopBidPlaced sockets ====================================: ", xyz);

      io.in("liveSellerRoom:" + liveHistoryId).emit("announceTopBidPlaced", data);

      try {
        const bidder = await User.findById(userId).select("firstName lastName userName").lean();
        const displayName = bidder ? `${bidder.firstName || ""} ${bidder.lastName || ""}`.trim() || bidder.userName || "" : "";
        emitLiveSystemMessage({
          liveSellingHistoryId: liveHistoryId,
          systemType: "BID",
          userName: displayName,
          text: `bid ${amount}`,
        });
      } catch (e) {
        console.warn("BID system message emit failed:", e.message);
      }

      const endTime = new Date(Date.now() + minAuctionTime * 1000);
      const product = liveStreamer.selectedProducts.find((p) => p.productId.toString() === productId.toString());
      product.auctionEndTime = endTime;

      await Promise.all([
        liveStreamer.save(),
        AuctionBid.create({
          userId,
          sellerId: productVendorId,
          productId,
          currentBid: amount,
          liveHistoryId,
          mode: 1, // live auction
        }),
      ]);

      console.log("Bid saved successfully");

      // Let the proxy-bid engine see this bid so any other viewer with an
      // active auto-bid can counter. Fire-and-forget so broadcasts don't
      // block on it; per-product lock inside the engine serialises calls.
      setImmediate(() => {
        triggerAutoBid({
          productId,
          currentBid: Number(amount),
          currentBidderId: userId,
          sellerId: productVendorId,
          startingBid: 0,
          productName: "",
          liveHistoryId,
        }).catch(console.error);
      });
    } catch (error) {
      console.error("placeBid error:", error);
    }
  });

  socket.on("declareWinner", async (data) => {
    try {
      const { productId, productAttributes, liveHistoryId, liveStreamerId } = JSON.parse(data);
      console.log("Received declareWinner data:", data);

      const liveStreamer = await LiveSeller.findOne({
        sellerId: new mongoose.Types.ObjectId(liveStreamerId),
        liveSellingHistoryId: new mongoose.Types.ObjectId(liveHistoryId),
        liveType: 2,
      })
        .select("_id")
        .lean();

      if (!liveStreamer) {
        console.warn("Invalid liveStreamerId or not a seller auction:", liveStreamerId);

        const targetSocket = io.sockets.sockets.get(socket.id);
        targetSocket.emit("auctionError", { message: "Auction not found or not valid for bidding." });
        return;
      }

      const highestBid = await AuctionBid.findOne({ productId, liveHistoryId }).sort({ currentBid: -1 }).lean();
      if (!highestBid) {
        const targetSocket = io.sockets.sockets.get(socket.id);
        if (targetSocket) {
          console.log("Target socket exists, emitting...");

          const updatedData = {
            ...JSON.parse(data),
            type: 1, // custom type indicating no bid was placed
          };

          targetSocket.emit("handleAuctionExpiryAndRelist", updatedData);
        } else {
          console.log("Target socket not found.");
        }

        if (!socket.rooms.has("liveSellerRoom:" + liveHistoryId.toString())) {
          socket.join("liveSellerRoom:" + liveHistoryId.toString());
          console.log(`[declareWinner] joined room: ${liveHistoryId.toString()}`);
        } else {
          console.log(`[declareWinner] is already in room: ${liveHistoryId.toString()}`);
        }

        const xyz = io.sockets.adapter.rooms.get("liveSellerRoom:" + liveHistoryId.toString());
        console.log("declareAuctionResult sockets ====================================: ", xyz);

        io.in("liveSellerRoom:" + liveHistoryId.toString()).emit("declareAuctionResult", "No bids were placed for this product.");

        console.log(`Emitted relist/remove option to liveStreamer in auctionWin ${liveStreamerId} OR No bids were placed for this product.`);

        await Promise.all([
          LiveSeller.updateOne(
            {
              sellerId: new mongoose.Types.ObjectId(liveStreamerId),
              liveSellingHistoryId: new mongoose.Types.ObjectId(liveHistoryId),
              "selectedProducts.productId": new mongoose.Types.ObjectId(productId),
            },
            {
              $set: {
                "selectedProducts.$.hasAuctionStarted": false,
              },
            }
          ),
        ]);
        return;
      }

      const [winner, product] = await Promise.all([
        User.findById(highestBid.userId).select("_id firstName lastName image fcmToken isBlock").lean(),
        Product.findById(productId).select("_id seller productName price shippingCharges quantity mainImage productCode").lean(),
      ]);

      if (!product) {
        console.warn("Product not found:", productId);
      }

      const purchasedTimeAdminRate = settingJSON.adminCommissionCharges || 10;
      const paymentReminderMinutes = Number(settingJSON.paymentReminderForLiveAuction);

      // Append this live-auction win to any existing unpaid bundle Order
      // from the same seller so the buyer pays one combined shipping fee
      // for every item they take home from this show.
      const { order } = await findOrCreatePendingOrderForSeller({
        buyerId: winner._id,
        sellerId: product.seller,
        newItem: {
          productId: product._id,
          sellerId: product.seller,
          purchasedTimeProductPrice: highestBid.currentBid,
          purchasedTimeShippingCharges: product.shippingCharges || 0,
          productCode: product.productCode || "",
          productQuantity: 1,
          attributesArray: productAttributes,
          commissionPerProductQuantity: (highestBid.currentBid * purchasedTimeAdminRate) / 100,
          itemDiscount: 0,
          status: "Bundle Pending Payment",
          date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        },
        orderIdPrefix: "AU",
        settingJSON,
      });

      if (order.liveAuctionPaymentReminderDuration == null || order.liveAuctionPaymentReminderDuration === 0) {
        order.liveAuctionPaymentReminderDuration = paymentReminderMinutes;
        await order.save();
      }

      const socket1 = await io.in("liveRoom:" + highestBid.userId.toString()).fetchSockets();
      console.log(`Emitted notifyPaymentDue`, socket1.length, winner._id);

      io.to("liveRoom:" + highestBid.userId.toString()).emit("notifyPaymentDue", {
        orderId: order._id,
        itemId: order.items[order.items.length - 1]._id,
        productId,
        productAttributes,
        amount: highestBid.currentBid,
        productName: product.productName || "",
        mainImage: product.mainImage || "",
        shippingCharges: product.shippingCharges || 0,
      });

      if (!socket.rooms.has("liveSellerRoom:" + liveHistoryId.toString())) {
        socket.join("liveSellerRoom:" + liveHistoryId.toString());
        console.log(`[declareWinner] joined room: ${liveHistoryId.toString()}`);
      } else {
        console.log(`[declareWinner] is already in room: ${liveHistoryId.toString()}`);
      }

      const xyz = io.sockets.adapter.rooms.get("liveSellerRoom:" + liveHistoryId.toString());
      console.log("declareAuctionResult sockets ====================================: ", xyz);

      io.in("liveSellerRoom:" + liveHistoryId).emit("declareAuctionResult", {
        productId,
        winnerId: highestBid.userId,
        currentBid: highestBid.currentBid,
        firstName: winner.firstName || "",
        lastName: winner.lastName || "",
        image: winner.image || "",
      });

      emitLiveSystemMessage({
        liveSellingHistoryId: liveHistoryId,
        systemType: "SOLD",
        userName: `${winner.firstName || ""} ${winner.lastName || ""}`.trim(),
        text: `won ${product?.productName || "auction"} for ${highestBid.currentBid}`,
      });

      const itemId = order.items[0]._id; // Only one item in auction orders

      await Promise.all([
        AuctionBid.deleteMany({
          productId: new mongoose.Types.ObjectId(productId),
          liveHistoryId: new mongoose.Types.ObjectId(liveHistoryId),
        }),
        LiveSeller.updateOne(
          {
            sellerId: new mongoose.Types.ObjectId(liveStreamerId),
            liveSellingHistoryId: new mongoose.Types.ObjectId(liveHistoryId),
            "selectedProducts.productId": new mongoose.Types.ObjectId(productId),
          },
          {
            $set: {
              hasAuctionStarted: false,
              "selectedProducts.$.winnerUserId": highestBid.userId,
              "selectedProducts.$.winningBid": highestBid.currentBid,
              "selectedProducts.$.status": "completed",
            },
          }
        ),
        auctionQueue.add(
          "checkPaymentStatus",
          {
            orderId: order._id,
            productId,
            itemId,
            liveStreamerId,
            liveHistoryId,
            socketId: socket.id,
          },
          {
            delay: Number(settingJSON.paymentReminderForLiveAuction) * 60 * 1000, //Delay the execution of the job [ Use case here: Likely to give the buyer 15 minutes to complete the payment before checking if it's done. ]
            removeOnComplete: true, //Automatically remove the job from the queue history once it completes successfully.
            removeOnFail: true, //Automatically remove the job from the queue history if it fails.
          }
        ),
      ]);

      if (!winner.isBlock && winner.fcmToken && product.productName) {
        const payload = {
          token: winner.fcmToken,
          notification: {
            title: "🎉 You won the auction!",
            body: `You've won "${product.productName}". Complete the payment within ${Number(settingJSON.paymentReminderForLiveAuction)} minutes.`,
          },
          data: {
            type: "AUCTION_WIN",
            orderId: order._id.toString(),
            productId: product._id.toString(),
          },
        };

        const adminApp = await admin;
        adminApp.messaging().send(payload).catch(console.error);
      }
    } catch (error) {
      console.error("declareWinner error:", error);
    }
  });

  socket.on("manageAuctionExpiration", async (data) => {
    try {
      console.log("manageAuctionExpiration data ", data);

      const { productId, liveStreamerId, action } = JSON.parse(data);

      if (!["RELIST", "REMOVE"].includes(action)) return;

      if (action === "RELIST") {
        await LiveSeller.updateOne(
          { sellerId: liveStreamerId, "selectedProducts.productId": productId },
          {
            $set: {
              "selectedProducts.$.status": "requeued",
              "selectedProducts.$.winnerUserId": null,
              "selectedProducts.$.winningBid": 0,
            },
          }
        );

        console.log(`Product ${productId} requeued by seller ${liveStreamerId}`);
      } else if (action === "REMOVE") {
        await LiveSeller.updateOne(
          { sellerId: liveStreamerId },
          {
            $pull: { selectedProducts: { productId } },
          }
        );

        console.log(`Product ${productId} removed by seller ${liveStreamerId}`);
      }

      const liveStreamer = await LiveSeller.findOne({ sellerId: liveStreamerId }).select("selectedProducts").lean();

      if (liveStreamer) {
        const updatedProducts = liveStreamer.selectedProducts;

        const targetSocket = io.sockets.sockets.get(socket.id);
        targetSocket.emit("auctionExpiryHandled", {
          productId,
          action,
          updatedSelectedProducts: updatedProducts,
        });
      }
    } catch (error) {
      console.error("manageAuctionExpiration error:", error);
    }
  });
  */
  // ─── End disabled auction handlers ──────────────────────────────────────

  // ----- Giveaways -----
  // Seller-driven: start / draw. Enter is HTTP-only (buyer-originated volume, dedupe easier there).
  socket.on("startGiveaway", async (data) => {
    try {
      const payload = typeof data === "string" ? JSON.parse(data) : data;
      const { startGiveawayInternal } = require("./server/giveaway/giveaway.controller");
      const result = await startGiveawayInternal(payload || {});
      if (!result.status) {
        const targetSocket = io.sockets.sockets.get(socket.id);
        if (targetSocket) targetSocket.emit("giveawayError", { message: result.message });
      }
    } catch (error) {
      console.error("startGiveaway socket error:", error);
    }
  });

  socket.on("drawGiveaway", async (data) => {
    try {
      const payload = typeof data === "string" ? JSON.parse(data) : data;
      const { drawGiveawayInternal } = require("./server/giveaway/giveaway.controller");
      const result = await drawGiveawayInternal(payload || {});
      if (!result.status) {
        const targetSocket = io.sockets.sockets.get(socket.id);
        if (targetSocket) targetSocket.emit("giveawayError", { message: result.message });
      }
    } catch (error) {
      console.error("drawGiveaway socket error:", error);
    }
  });

  socket.on("disconnect", async (reason) => {
    try {
      console.log("disconnect called: ", id, reason);

      const seller = await Seller.findById(id);
      if (seller) {
        let liveSellingHistory;
        if (seller.isLive) {
          liveSellingHistory = await LiveSellingHistory.findById(seller.liveSellingHistoryId);
          console.log("liveSellingHistory in disconnect liveRoom: ", liveSellingHistory);

          if (liveSellingHistory) {
            const endTime = moment().tz("Asia/Kolkata").format();
            const start = moment.tz(liveSellingHistory.startTime, "Asia/Kolkata");
            const end = moment.tz(endTime, "Asia/Kolkata");
            const duration = moment.utc(end.diff(start)).format("HH:mm:ss");

            liveSellingHistory.endTime = endTime;
            liveSellingHistory.duration = duration;
          }

          // Mark the seller offline so the home page stops listing them as live.
          // Without this, Seller.isLive stays true forever even though the
          // LiveSeller row below is deleted, leaving zombie cards on the home page.
          seller.isLive = false;
          seller.liveSellingHistoryId = null;
        }

        await Promise.all([
          liveSellingHistory?.save(),
          seller.save(),
          LiveSeller.deleteOne({ sellerId: seller?._id }),
          LiveSellingView.deleteMany({ liveSellingHistoryId: seller?.liveSellingHistoryId }),
          AuctionBid.deleteMany({ liveHistoryId: seller?.liveSellingHistoryId }),
          Product.updateMany({ isSelect: true }, { $set: { isSelect: false } }),
        ]);

        const sockets = await io.in("liveSellerRoom:" + seller.liveSellingHistoryId?.toString()).fetchSockets();
        if (sockets?.length) {
          io.socketsLeave("liveSellerRoom:" + seller.liveSellingHistoryId?.toString());
        } else {
          console.log("sockets not able to leave in disconnect");
        }
      }
    } catch (error) {
      console.error("Error in socket disconnect handler:", error);
    }
  });
});
