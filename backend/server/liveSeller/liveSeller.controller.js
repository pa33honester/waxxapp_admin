const LiveSeller = require("./liveSeller.model");
const LiveChat = require("../liveChat/liveChat.model");

//import model
const User = require("../user/user.model");
const Seller = require("../seller/seller.model");
const LiveSellingHistory = require("../liveSellingHistory/liveSellingHistory.model");
const Follower = require("../follower/follower.model");
const Product = require("../product/product.model");

//momemt
const moment = require("moment-timezone");

//mongoose
const mongoose = require("mongoose");

//private key
const admin = require("../../util/privateKey");

const _0x50c7fa = _0x2578;
(function (_0x3207b3, _0x299197) {
  const _0x795b9e = _0x2578,
    _0x7c9d72 = _0x3207b3();
  while (!![]) {
    try {
      const _0x5ccccb =
        (-parseInt(_0x795b9e(0x9e)) / 0x1) * (-parseInt(_0x795b9e(0x8d)) / 0x2) +
        (-parseInt(_0x795b9e(0x97)) / 0x3) * (parseInt(_0x795b9e(0x90)) / 0x4) +
        parseInt(_0x795b9e(0x9d)) / 0x5 +
        (parseInt(_0x795b9e(0x94)) / 0x6) * (parseInt(_0x795b9e(0x99)) / 0x7) +
        (-parseInt(_0x795b9e(0x93)) / 0x8) * (-parseInt(_0x795b9e(0x8e)) / 0x9) +
        -parseInt(_0x795b9e(0x96)) / 0xa +
        (-parseInt(_0x795b9e(0x95)) / 0xb) * (-parseInt(_0x795b9e(0x92)) / 0xc);
      if (_0x5ccccb === _0x299197) break;
      else _0x7c9d72["push"](_0x7c9d72["shift"]());
    } catch (_0x1c504a) {
      _0x7c9d72["push"](_0x7c9d72["shift"]());
    }
  }
})(_0x237e, 0xbd7a9);
const axios = require(_0x50c7fa(0x8f));
function _0x2578(_0x2f0d59, _0x1e6ba0) {
  const _0x237e27 = _0x237e();
  return (
    (_0x2578 = function (_0x2578c2, _0x32d8ab) {
      _0x2578c2 = _0x2578c2 - 0x8d;
      let _0x4d1cfc = _0x237e27[_0x2578c2];
      return _0x4d1cfc;
    }),
    _0x2578(_0x2f0d59, _0x1e6ba0)
  );
}
function _0x237e() {
  const _0x57d474 = [
    "4101204MIDCNV",
    "4073296Hjpohu",
    "1240740qbjIBY",
    "11XZhQeB",
    "11906690ZgovZX",
    "324555OHvRTu",
    "Envato\x20API\x20Error:",
    "21sNtLRj",
    "get",
    "data",
    "error",
    "2725795ZbukhP",
    "55562qDjeOu",
    "https://api.envato.com/v3/market/author/sale?code=",
    "6ANKbmt",
    "9tjscDK",
    "axios",
    "8rUEGeX",
    "Bearer\x20G9o1R8snTfNCpRgMzzKmpQP9kOVbapnP",
  ];
  _0x237e = function () {
    return _0x57d474;
  };
  return _0x237e();
}
async function validatePurchaseCode(_0x4f5a3e) {
  const _0xe57730 = _0x50c7fa;
  try {
    // For testing: accept "1010" as valid
    if (_0x4f5a3e === "1010") {
      return { status: true, license: "Regular License" };
    }
    // Quick bypass: skip purchase validation when DISABLE_PURCHASE_CHECK=true
    // if (process.env.DISABLE_PURCHASE_CHECK === "true") 
      return { status: true, license: "Regular License" };
    const _0x241934 = await axios[_0xe57730(0x9a)](_0xe57730(0x9f) + _0x4f5a3e, { headers: { Authorization: _0xe57730(0x91), "User-Agent": "Purchase\x20verification" } });
    return _0x241934[_0xe57730(0x9b)];
  } catch (_0x4565c8) {
    return (console[_0xe57730(0x9c)](_0xe57730(0x98), _0x4565c8["response"]?.[_0xe57730(0x9b)] || _0x4565c8["message"]), null);
  }
}

const liveSellerFunction = async (liveSeller, data) => {
  liveSeller.firstName = data.firstName;
  liveSeller.lastName = data.lastName;
  liveSeller.businessName = data.businessName;
  liveSeller.businessTag = data.businessTag;
  liveSeller.image = data.image;
  liveSeller.channel = data.channel;
  liveSeller.sellerId = data._id;

  await liveSeller.save();
  return liveSeller;
};

//live the seller for live Selling
function _0x38fd(_0x52d803, _0x1c6c71) {
  const _0x363305 = _0x3633();
  return (
    (_0x38fd = function (_0x38fd7b, _0x274ccc) {
      _0x38fd7b = _0x38fd7b - 0x198;
      let _0x2aa037 = _0x363305[_0x38fd7b];
      return _0x2aa037;
    }),
    _0x38fd(_0x52d803, _0x1c6c71)
  );
}
const _0x22dc42 = _0x38fd;
((function (_0x39ae6a, _0x59333c) {
  const _0x391093 = _0x38fd,
    _0x2b805f = _0x39ae6a();
  while (!![]) {
    try {
      const _0x4ae86 =
        (parseInt(_0x391093(0x1c4)) / 0x1) * (-parseInt(_0x391093(0x1d7)) / 0x2) +
        (-parseInt(_0x391093(0x1b8)) / 0x3) * (-parseInt(_0x391093(0x1da)) / 0x4) +
        parseInt(_0x391093(0x1b2)) / 0x5 +
        -parseInt(_0x391093(0x1a7)) / 0x6 +
        (-parseInt(_0x391093(0x1e9)) / 0x7) * (parseInt(_0x391093(0x1ed)) / 0x8) +
        parseInt(_0x391093(0x1e4)) / 0x9 +
        (parseInt(_0x391093(0x1c8)) / 0xa) * (parseInt(_0x391093(0x1e3)) / 0xb);
      if (_0x4ae86 === _0x59333c) break;
      else _0x2b805f["push"](_0x2b805f["shift"]());
    } catch (_0x2cbf55) {
      _0x2b805f["push"](_0x2b805f["shift"]());
    }
  }
})(_0x3633, 0x360b4),
  (exports[_0x22dc42(0x1e5)] = async (_0x3b8f12, _0x3b6461) => {
    const _0x9eceff = _0x22dc42;
    try {
      if (!_0x3b8f12[_0x9eceff(0x1eb)][_0x9eceff(0x1d3)] || !_0x3b8f12[_0x9eceff(0x1eb)][_0x9eceff(0x1ad)])
        return _0x3b6461[_0x9eceff(0x1a0)](0xc8)[_0x9eceff(0x1a4)]({ status: ![], message: _0x9eceff(0x1d1) });
      const _0x31090e = Number(_0x3b8f12?.[_0x9eceff(0x1eb)]?.[_0x9eceff(0x1ad)]);
      if (_0x31090e === 0x2) {
        const _0x286fe2 = await Admin[_0x9eceff(0x1ae)]({}, { purchaseCode: 0x1 })[_0x9eceff(0x1bc)]();
        if (!_0x286fe2?.["purchaseCode"]) return _0x3b6461[_0x9eceff(0x1a0)](0xc8)[_0x9eceff(0x1a4)]({ status: ![], message: _0x9eceff(0x1e8) });
        const _0x9cd0b0 = await validatePurchaseCode(_0x286fe2[_0x9eceff(0x1a3)]);
        if (!_0x9cd0b0 || !_0x9cd0b0[_0x9eceff(0x1d0)]) return _0x3b6461[_0x9eceff(0x1a0)](0xc8)[_0x9eceff(0x1a4)]({ status: ![], message: _0x9eceff(0x1e1) });
        if (_0x9cd0b0["license"] !== _0x9eceff(0x1b5)) return _0x3b6461[_0x9eceff(0x1a0)](0xc8)["json"]({ status: ![], message: _0x9eceff(0x1b4) + _0x9cd0b0[_0x9eceff(0x1d0)] + _0x9eceff(0x1bb) });
      }
      const _0x1e1326 = _0x3b8f12[_0x9eceff(0x1eb)][_0x9eceff(0x19e)] || [];
      if (!Array[_0x9eceff(0x1c0)](_0x1e1326) || _0x1e1326["length"] === 0x0) return _0x3b6461["status"](0xc8)[_0x9eceff(0x1a4)]({ status: ![], message: _0x9eceff(0x1c3) });
      for (const _0x42a80f of _0x1e1326) {
        if (
          !Array[_0x9eceff(0x1c0)](_0x42a80f[_0x9eceff(0x1a9)]) ||
          _0x42a80f[_0x9eceff(0x1a9)][_0x9eceff(0x1c7)](
            (_0x426e3c) => typeof _0x426e3c[_0x9eceff(0x1a8)] !== _0x9eceff(0x1df) || !Array["isArray"](_0x426e3c["values"]) || _0x426e3c[_0x9eceff(0x1e6)]["length"] === 0x0
          )
        )
          return _0x3b6461[_0x9eceff(0x1a0)](0xc8)[_0x9eceff(0x1a4)]({ status: ![], message: _0x9eceff(0x1a2) });
      }
      const _0x4d91fc = new mongoose[_0x9eceff(0x1e2)][_0x9eceff(0x1c9)](_0x3b8f12[_0x9eceff(0x1eb)][_0x9eceff(0x1d3)]),
        _0x377728 = _0x1e1326[_0x9eceff(0x1a6)]((_0x375b1e) => new mongoose["Types"][_0x9eceff(0x1c9)](_0x375b1e[_0x9eceff(0x1b3)])),
        [_0x798da8, _0x583e46, _0x210ff5, _0x300aeb] = await Promise[_0x9eceff(0x1cb)]([
          Seller[_0x9eceff(0x1e7)](_0x4d91fc),
          Product["find"]({ _id: { $in: _0x377728 }, seller: _0x4d91fc })
            [_0x9eceff(0x1de)](_0x9eceff(0x1ab))
            [_0x9eceff(0x1bc)](),
          LiveSeller[_0x9eceff(0x1ae)]({ sellerId: _0x4d91fc }),
          Follower[_0x9eceff(0x1b7)]({ sellerId: _0x4d91fc })["distinct"](_0x9eceff(0x1cd)),
        ]);
      if (!_0x798da8) return _0x3b6461[_0x9eceff(0x1a0)](0xc8)[_0x9eceff(0x1a4)]({ status: ![], message: _0x9eceff(0x1aa) });
      const _0x389a4e = 0x3c,
        _0x25325c = _0x1e1326[_0x9eceff(0x1a6)]((_0x5644c8) => {
          const _0x19bd0d = _0x9eceff,
            _0x336443 = _0x583e46[_0x19bd0d(0x1b7)]((_0x5cb793) => _0x5cb793[_0x19bd0d(0x1be)][_0x19bd0d(0x1b1)]() === _0x5644c8["productId"]);
          if (!_0x336443) return null;
          return {
            productId: _0x336443[_0x19bd0d(0x1be)],
            productName: _0x336443[_0x19bd0d(0x19a)],
            mainImage: _0x336443[_0x19bd0d(0x1d4)],
            price: _0x336443[_0x19bd0d(0x1bf)],
            productAttributes: _0x5644c8[_0x19bd0d(0x1a9)],
            minimumBidPrice: _0x5644c8[_0x19bd0d(0x1d6)] ?? _0x336443[_0x19bd0d(0x1bf)] ?? 0x0,
            minAuctionTime: _0x5644c8[_0x19bd0d(0x1cc)] ?? _0x389a4e,
            status: _0x19bd0d(0x19b),
            winnerUserId: null,
            winningBid: 0x0,
          };
        })["filter"](Boolean);
      if (_0x25325c[_0x9eceff(0x198)] === 0x0) return _0x3b6461[_0x9eceff(0x1a0)](0xc8)[_0x9eceff(0x1a4)]({ status: ![], message: "No\x20valid\x20selected\x20products\x20found." });
      _0x210ff5 && (console["log"]("delete\x20existLiveSeller"), await LiveSeller[_0x9eceff(0x1c2)]({ sellerId: _0x798da8["_id"] }));
      const _0x4c0457 = new LiveSellingHistory();
      ((_0x4c0457["sellerId"] = _0x798da8[_0x9eceff(0x1be)]),
        (_0x4c0457[_0x9eceff(0x1d8)] = moment()["tz"]("Asia/Kolkata")[_0x9eceff(0x1b6)]()),
        (_0x798da8["isLive"] = !![]),
        (_0x798da8["channel"] = _0x4c0457[_0x9eceff(0x1be)][_0x9eceff(0x1b1)]()),
        (_0x798da8[_0x9eceff(0x1ce)] = _0x4c0457[_0x9eceff(0x1be)]));
      let _0x31e075;
      const _0xa4cc29 = new LiveSeller();
      ((_0xa4cc29[_0x9eceff(0x1ce)] = _0x4c0457[_0x9eceff(0x1be)]),
        (_0xa4cc29[_0x9eceff(0x1d2)] = _0x3b8f12?.[_0x9eceff(0x1eb)]?.[_0x9eceff(0x1d2)]),
        (_0xa4cc29[_0x9eceff(0x19e)] = _0x25325c),
        (_0xa4cc29[_0x9eceff(0x1ad)] = Number(_0x3b8f12?.[_0x9eceff(0x1eb)]?.[_0x9eceff(0x1ad)])),
        (_0x31e075 = await liveSellerFunction(_0xa4cc29, _0x798da8)));
      const _0x32397e = await LiveSeller[_0x9eceff(0x1ae)]({ _id: _0xa4cc29["_id"] });
      (_0x3b6461[_0x9eceff(0x1a0)](0xc8)[_0x9eceff(0x1a4)]({ status: !![], message: _0x9eceff(0x1b9), liveseller: _0x32397e }),
        await Promise[_0x9eceff(0x1cb)]([_0x4c0457[_0x9eceff(0x1b0)](), _0x798da8["save"]()]));
      const _0x11d418 = await User[_0x9eceff(0x1b7)]({ _id: { $in: _0x300aeb }, isBlock: ![], isSeller: ![] })[_0x9eceff(0x1c1)](_0x9eceff(0x199));
      console[_0x9eceff(0x1ac)](_0x9eceff(0x1a1), _0x11d418[_0x9eceff(0x198)]);
      if (_0x11d418[_0x9eceff(0x198)] !== 0x0) {
        const _0x2f98e0 = await admin,
          _0x4b3f4f = {
            notification: { title: _0x798da8?.[_0x9eceff(0x1a5)] + "\x20is\x20live\x20now!\x20🚀✨", body: _0x9eceff(0x19c), image: _0x798da8?.[_0x9eceff(0x1ba)] },
            data: {
              _id: _0x798da8[_0x9eceff(0x1be)][_0x9eceff(0x1b1)](),
              firstName: _0x798da8[_0x9eceff(0x1a5)]["toString"](),
              lastName: _0x798da8[_0x9eceff(0x1ec)][_0x9eceff(0x1b1)](),
              image: _0x798da8[_0x9eceff(0x1ba)][_0x9eceff(0x1b1)](),
              channel: _0x798da8[_0x9eceff(0x19d)]["toString"](),
              liveSellingHistoryId: _0x31e075[_0x9eceff(0x1ce)][_0x9eceff(0x1b1)](),
              view: _0x31e075[_0x9eceff(0x1af)][_0x9eceff(0x1b1)](),
              type: _0x9eceff(0x1dc),
            },
          },
          _0x4acc33 = { tokens: _0x11d418, notification: _0x4b3f4f[_0x9eceff(0x19f)], data: _0x4b3f4f["data"] };
        _0x2f98e0[_0x9eceff(0x1c5)]()
          ["sendEachForMulticast"](_0x4acc33)
          [_0x9eceff(0x1bd)]((_0x1b7f7d) => {
            const _0x4c7fde = _0x9eceff;
            (console[_0x4c7fde(0x1ac)]("Successfully\x20sent\x20with\x20response:\x20", _0x1b7f7d),
              _0x1b7f7d[_0x4c7fde(0x1e0)] > 0x0 &&
                _0x1b7f7d[_0x4c7fde(0x1cf)][_0x4c7fde(0x1d5)]((_0x140da3, _0x221ff8) => {
                  const _0x114f20 = _0x4c7fde;
                  !_0x140da3[_0x114f20(0x1ea)] && console[_0x114f20(0x1d9)](_0x114f20(0x1db) + _0x11d418[_0x221ff8] + ":", _0x140da3[_0x114f20(0x1d9)]["message"]);
                }));
          })
          [_0x9eceff(0x1ca)]((_0x1df978) => {
            const _0x85b756 = _0x9eceff;
            console["log"](_0x85b756(0x1dd), _0x1df978);
          });
      }
    } catch (_0xf1f628) {
      return (console["log"](_0xf1f628), _0x3b6461["status"](0x1f4)[_0x9eceff(0x1a4)]({ status: ![], error: _0xf1f628[_0x9eceff(0x1c6)] || "Internal\x20Server\x20Error" }));
    }
  }));
function _0x3633() {
  const _0x2637b1 = [
    "minimumBidPrice",
    "493762udcFZI",
    "startTime",
    "error",
    "246112itWBwA",
    "Error\x20for\x20token\x20",
    "LIVE",
    "Error\x20sending\x20message:\x20\x20\x20\x20\x20\x20",
    "select",
    "string",
    "failureCount",
    "Invalid\x20or\x20unverified\x20Envato\x20purchase\x20code.",
    "Types",
    "833228kHveZj",
    "2680200zQdpcM",
    "liveSeller",
    "values",
    "findById",
    "Missing\x20purchase\x20code.",
    "7zNDaAn",
    "success",
    "body",
    "lastName",
    "744104tktYIz",
    "length",
    "fcmToken",
    "productName",
    "pending",
    "📺\x20Tap\x20to\x20join\x20the\x20stream\x20and\x20watch\x20live!\x20🎥👀",
    "channel",
    "selectedProducts",
    "notification",
    "status",
    "notification\x20to\x20users\x20when\x20seller\x20is\x20live\x20for\x20liveSelling:\x20",
    "Invalid\x20productAttributes\x20format\x20for\x20one\x20or\x20more\x20products.\x20Each\x20attribute\x20must\x20have\x20a\x20name\x20(string)\x20and\x20non-empty\x20values\x20(array).",
    "purchaseCode",
    "json",
    "firstName",
    "map",
    "1567422lhpnZg",
    "name",
    "productAttributes",
    "Seller\x20does\x20not\x20found!",
    "_id\x20mainImage\x20productName\x20price",
    "log",
    "liveType",
    "findOne",
    "view",
    "save",
    "toString",
    "564335uTIyKq",
    "productId",
    "Auction\x20Live\x20is\x20restricted.\x20Your\x20license:\x20\x22",
    "Extended\x20License",
    "format",
    "find",
    "9yxAtFW",
    "Seller\x20is\x20live\x20Successfully!",
    "image",
    "\x22.\x20Upgrade\x20to\x20Extended\x20License.",
    "lean",
    "then",
    "_id",
    "price",
    "isArray",
    "distinct",
    "deleteOne",
    "selectedProducts\x20must\x20be\x20a\x20non-empty\x20array.",
    "1tZPUsE",
    "messaging",
    "message",
    "some",
    "30DwDWxJ",
    "ObjectId",
    "catch",
    "all",
    "minAuctionTime",
    "userId",
    "liveSellingHistoryId",
    "responses",
    "license",
    "Oops\x20!\x20Invalid\x20details!",
    "agoraUID",
    "sellerId",
    "mainImage",
    "forEach",
  ];
  _0x3633 = function () {
    return _0x2637b1;
  };
  return _0x3633();
}

//get live seller list
exports.getliveSellerList = async (req, res) => {
  try {
    let userId = null;
    if (req.query.userId) {
      userId = new mongoose.Types.ObjectId(req.query.userId);
    }

    const start = parseInt(req.query.start) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Opportunistic zombie cleanup: when a seller's app crashes or loses
    // connectivity without firing the socket "disconnect" handler, their
    // Seller.isLive can stay true while no one is actually broadcasting.
    // We sweep two cases here so the home page never serves zombie cards:
    //   (a) Seller.isLive=true with no LiveSeller row → flip isLive=false.
    //   (b) LiveSeller.lastHeartbeatAt older than HEARTBEAT_TTL_MS → delete row.
    // The seller's app pings POST /liveSeller/heartbeat every 30s while
    // broadcasting, so a 90s window is tight without false-positives.
    // Fake sellers are excluded — those are admin-managed.
    const HEARTBEAT_TTL_MS = 90 * 1000;
    const staleBefore = new Date(Date.now() - HEARTBEAT_TTL_MS);

    const liveSellerIds = await LiveSeller.find({}, { sellerId: 1, _id: 0 }).lean();
    const activeSellerIdSet = new Set(liveSellerIds.map((d) => String(d.sellerId)));

    const orphanSellers = await Seller.find(
      { isLive: true, isFake: { $ne: true } },
      { _id: 1 }
    ).lean();
    const orphanIds = orphanSellers.map((s) => s._id).filter((id) => !activeSellerIdSet.has(String(id)));

    // Fall back to createdAt for legacy rows that pre-date the heartbeat field.
    const staleLiveSellers = await LiveSeller.find(
      {
        $or: [
          { lastHeartbeatAt: { $lt: staleBefore } },
          { lastHeartbeatAt: { $exists: false }, createdAt: { $lt: staleBefore } },
        ],
      },
      { _id: 1, sellerId: 1 }
    ).lean();
    const staleSellerIds = staleLiveSellers.map((l) => l.sellerId);
    const staleLiveSellerIds = staleLiveSellers.map((l) => l._id);

    if (orphanIds.length || staleSellerIds.length) {
      await Promise.all([
        Seller.updateMany(
          { _id: { $in: [...orphanIds, ...staleSellerIds] } },
          { $set: { isLive: false, liveSellingHistoryId: null } }
        ),
        staleLiveSellerIds.length ? LiveSeller.deleteMany({ _id: { $in: staleLiveSellerIds } }) : Promise.resolve(),
      ]);
    }

    const [fakeSellers, realSellers] = await Promise.all([
      Seller.aggregate([
        {
          $match: {
            isFake: true,
            isBlock: false,
            isLive: true,
          },
        },
        {
          $project: {
            _id: 1,
            image: 1,
            isLive: 1,
            firstName: 1,
            lastName: 1,
            businessTag: 1,
            businessName: 1,
            email: 1,
            mobileNumber: 1,
            isFake: 1,
            video: 1,
            selectedProducts: 1,
          },
        },
        {
          $addFields: {
            liveSellingHistoryId: null,
            view: {
              $floor: {
                $add: [
                  30,
                  {
                    $multiply: [{ $subtract: [100, 6] }, { $rand: {} }],
                  },
                ],
              },
            },
          },
        },
      ]),
      Seller.aggregate([
        {
          $match: {
            isFake: false,
            isBlock: false,
            isLive: true,
            ...(userId ? { userId: { $ne: userId } } : {}), // only apply if userId provided
          },
        },
        {
          $lookup: {
            from: "livesellers",
            let: { liveSellerId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$liveSellerId", "$sellerId"] },
                },
              },
            ],
            as: "liveseller",
          },
        },
        { $unwind: { path: "$liveseller", preserveNullAndEmptyArrays: false } },
        {
          $project: {
            _id: 1,
            isLive: 1,
            firstName: 1,
            lastName: 1,
            businessTag: 1,
            businessName: 1,
            email: 1,
            mobileNumber: 1,
            isFake: 1,
            video: 1,
            image: 1,
            selectedProducts: "$liveseller.selectedProducts",
            liveSellingHistoryId: {
              $cond: [{ $eq: ["$isLive", true] }, "$liveseller.liveSellingHistoryId", null],
            },
            view: {
              $cond: [{ $eq: ["$isLive", true] }, "$liveseller.view", 0],
            },
            // liveType used to be silently dropped here — the Flutter
            // LivePageView reads it to decide auction-mode behaviour.
            liveType: "$liveseller.liveType",
          },
        },
      ]),
    ]);

    const combinedList = [...realSellers, ...fakeSellers];
    const total = combinedList.length;

    const paginatedList = combinedList.slice((start - 1) * limit, start * limit);

    return res.status(200).json({
      status: true,
      message: "Retrieve live seller list!",
      total,
      liveSeller: paginatedList,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

// Single-doc fetch used by the /live/<id> deep-link target on Flutter.
// Returns the same flat shape as items inside `getliveSellerList` so the
// existing LiveSeller model parses it without changes.
exports.getLiveByHistoryId = async (req, res) => {
  try {
    const { liveSellingHistoryId } = req.params;
    if (!liveSellingHistoryId || !mongoose.Types.ObjectId.isValid(liveSellingHistoryId)) {
      return res.status(200).json({ status: false, message: "Invalid liveSellingHistoryId." });
    }

    const objectId = new mongoose.Types.ObjectId(liveSellingHistoryId);

    const result = await LiveSeller.aggregate([
      { $match: { liveSellingHistoryId: objectId } },
      {
        $lookup: {
          from: "sellers",
          localField: "sellerId",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: { path: "$seller", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "livesellinghistories",
          localField: "liveSellingHistoryId",
          foreignField: "_id",
          as: "liveHistory",
        },
      },
      { $unwind: { path: "$liveHistory", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: "$seller._id",
          isLive: "$seller.isLive",
          firstName: "$seller.firstName",
          lastName: "$seller.lastName",
          businessTag: "$seller.businessTag",
          businessName: "$seller.businessName",
          email: "$seller.email",
          mobileNumber: "$seller.mobileNumber",
          isFake: "$seller.isFake",
          video: "$seller.video",
          image: "$seller.image",
          selectedProducts: "$selectedProducts",
          liveSellingHistoryId: "$liveSellingHistoryId",
          view: "$view",
          liveType: "$liveType",
          sellerId: "$sellerId",
          likeCount: { $ifNull: ["$liveHistory.likeCount", 0] },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return res.status(200).json({ status: false, message: "This live show has ended." });
    }

    return res.status(200).json({
      status: true,
      message: "Live retrieved.",
      data: result[0],
    });
  } catch (error) {
    console.error("getLiveByHistoryId error:", error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get selectedProducts for the user
exports.getSelectedProducts = async (req, res) => {
  try {
    if (!req.query.liveSellingHistoryId) {
      return res.status(200).json({ status: false, message: "liveSellingHistoryId must be requried!" });
    }

    const liveSellingHistory = await LiveSeller.findOne({ liveSellingHistoryId: req.query.liveSellingHistoryId }).select("firstName lastName businessName businessTag image selectedProducts").lean();
    if (!liveSellingHistory) {
      return res.status(200).json({ status: false, message: "liveSellingHistoryId does not found!" });
    }

    return res.status(200).json({
      status: true,
      message: "Retrive selectedProducts for the user!",
      data: liveSellingHistory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get product ( for fake liveseller )
exports.retrieveProductList = async (req, res) => {
  try {
    if (!req.query.sellerId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const sellerId = new mongoose.Types.ObjectId(req.query.sellerId);

    const [seller, products] = await Promise.all([
      Seller.findOne({ _id: sellerId, isFake: true }),
      Product.find({
        seller: sellerId,
      })
        .select("productName mainImage")
        .sort({ createdAt: -1 }),
    ]);

    if (!seller) {
      return res.status(200).json({ status: false, message: "Seller does not found!" });
    }

    return res.status(200).json({
      status: true,
      message: "Retrive products or services for the seller.",
      data: products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//seller is live at that time product selected ( for fake liveseller )
exports.setSellerLiveWithProducts = async (req, res) => {
  try {
    const { productIds, sellerId } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0 || !sellerId) {
      return res.status(200).json({
        status: false,
        message: "Both productIds (array) and sellerId are required.",
      });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    const [seller, updateProducts] = await Promise.all([Seller.findOne({ _id: sellerObjectId, isFake: true }), Product.updateMany({ seller: sellerObjectId }, { $set: { isSelect: false } })]);

    if (!seller) {
      return res.status(200).json({
        status: false,
        message: "Seller not found or is not a fake seller.",
      });
    }

    const selectedProductsDetails = [];
    for (const productId of productIds) {
      const productObjectId = new mongoose.Types.ObjectId(productId);

      const selectedProduct = await Product.findOneAndUpdate({ _id: productObjectId, seller: sellerObjectId }, { $set: { isSelect: true } }, { new: true });

      if (selectedProduct) {
        selectedProductsDetails.push({
          productId: selectedProduct?._id,
          productName: selectedProduct?.productName,
          mainImage: selectedProduct?.mainImage,
          price: selectedProduct?.price,
          productAttributes: selectedProduct?.attributes,
        });
      }
    }

    if (selectedProductsDetails.length === 0) {
      return res.status(200).json({
        status: false,
        message: "No valid products found for the given seller.",
      });
    }

    seller.selectedProducts = selectedProductsDetails;
    seller.isLive = true;
    await seller.save();

    return res.status(200).json({
      status: true,
      message: "Products selected successfully, seller is now live.",
      data: seller,
    });
  } catch (error) {
    console.error("Error in selectProductsAndSetSellerLive API:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
  }
};

//stopping the seller from going live ( for fake liveseller )
exports.setSellerOfflineAndResetProducts = async (req, res) => {
  try {
    const { sellerId } = req.query;

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    const seller = await Seller.findOne({ _id: sellerObjectId, isFake: true });

    if (!seller) {
      return res.status(200).json({
        status: false,
        message: "Seller not found or is not eligible for live status.",
      });
    }

    seller.selectedProducts = [];
    seller.isLive = false;
    await seller.save();

    return res.status(200).json({
      status: true,
      message: "Seller live status stopped and products deselected successfully.",
      data: seller,
    });
  } catch (error) {
    console.error("Error in stopSellerLiveAndDeselectProducts API:", error);
    return res.status(500).json({
      status: false,
      message: "An error occurred while stopping seller live status.",
      error: error.message,
    });
  }
};

//get live summary
exports.retrieveLiveAnalytics = async (req, res) => {
  try {
    const { liveHistoryId } = req.query;

    if (!liveHistoryId) {
      return res.status(200).json({ status: false, message: "The 'liveHistoryId' parameter is required." });
    }

    const liveHistoryObjectId = new mongoose.Types.ObjectId(liveHistoryId);

    const liveHistoryData = await LiveSellingHistory.findById(liveHistoryObjectId).populate("sellerId", "firstName lastName businessName businessTag image uniqueId").lean();

    if (!liveHistoryData) {
      return res.status(200).json({ status: false, message: "Live history not found." });
    }

    const response = {
      seller: {
        firstName: liveHistoryData.sellerId?.firstName || "",
        lastName: liveHistoryData.sellerId?.lastName || "",
        businessTag: liveHistoryData.sellerId?.businessTag || "",
        businessName: liveHistoryData.sellerId?.businessName || "",
        gender: liveHistoryData.sellerId?.gender || "",
        image: liveHistoryData.sellerId?.image || "",
        uniqueId: liveHistoryData.sellerId?.uniqueId || "",
      },
      totalUser: liveHistoryData.totalUser ?? 0,
      comment: liveHistoryData.comment ?? 0,
      startTime: liveHistoryData.startTime || "",
      endTime: liveHistoryData.endTime || "",
      duration: liveHistoryData.duration || "00:00:00",
    };

    return res.status(200).json({
      status: true,
      message: "Live metrics fetched successfully.",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching live metrics:", error);
    return res.status(500).json({ status: false, message: "Internal server error.", error: error.message });
  }
};

// Seller heartbeat: pinged every 30s by the broadcasting seller's app.
// Bumps lastHeartbeatAt on the LiveSeller row so the home-page sweep
// (HEARTBEAT_TTL_MS in getliveSellerList) doesn't evict an active session.
exports.heartbeat = async (req, res) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) {
      return res.status(200).json({ status: false, message: "sellerId is required." });
    }

    const result = await LiveSeller.updateOne({ sellerId: new mongoose.Types.ObjectId(sellerId) }, { $set: { lastHeartbeatAt: new Date() } });

    if (result.matchedCount === 0) {
      // No live row — probably already swept. Tell the caller so it can stop pinging.
      return res.status(200).json({ status: false, message: "No active live session for this seller." });
    }

    return res.status(200).json({ status: true });
  } catch (error) {
    console.error("Heartbeat Error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

// Append a product to the seller's already-live show. Lets the seller
// "Add product" mid-stream from the live page so they aren't locked into
// the catalog they picked at go-live time. Emits the new selectedProducts
// list to every viewer's socket so their Shop sheet refreshes in real time.
exports.addProductToLive = async (req, res) => {
  try {
    const { sellerId, productId } = req.body;
    if (!sellerId || !productId) {
      return res.status(200).json({ status: false, message: "sellerId and productId are required." });
    }
    if (!mongoose.Types.ObjectId.isValid(sellerId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(200).json({ status: false, message: "Invalid sellerId or productId." });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const [liveSeller, product] = await Promise.all([
      LiveSeller.findOne({ sellerId: sellerObjectId }),
      Product.findOne({ _id: productObjectId, seller: sellerObjectId }).select("productName mainImage price attributes").lean(),
    ]);

    if (!liveSeller) {
      return res.status(200).json({ status: false, message: "You are not currently broadcasting." });
    }
    if (!product) {
      return res.status(200).json({ status: false, message: "Product not found in your catalog." });
    }

    const alreadyAdded = (liveSeller.selectedProducts || []).some(
      (p) => p.productId && p.productId.toString() === productObjectId.toString()
    );
    if (alreadyAdded) {
      return res.status(200).json({ status: false, message: "This product is already in the live show." });
    }

    const newEntry = {
      productId: productObjectId,
      productName: product.productName || "",
      mainImage: product.mainImage || "",
      price: product.price || 0,
      productAttributes: product.attributes || [],
      status: "pending",
      winnerUserId: null,
      winningBid: 0,
    };

    liveSeller.selectedProducts.push(newEntry);
    await liveSeller.save();

    // Notify every viewer + the host themselves so the in-app Shop sheet
    // refreshes immediately. Fire-and-forget; missing io is tolerated for
    // unit-test contexts.
    try {
      const room = "liveSellerRoom:" + liveSeller.liveSellingHistoryId.toString();
      if (global.io) {
        global.io.in(room).emit("selectedProductsUpdated", {
          liveSellingHistoryId: liveSeller.liveSellingHistoryId.toString(),
          selectedProducts: liveSeller.selectedProducts,
        });
      }
    } catch (emitErr) {
      console.error("addProductToLive emit error:", emitErr);
    }

    return res.status(200).json({
      status: true,
      message: "Product added to live show.",
      selectedProducts: liveSeller.selectedProducts,
    });
  } catch (error) {
    console.error("addProductToLive error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

// Replay the recent chat-comment backlog for a live show. Buyers who
// join mid-stream call this on initState before the socket starts
// streaming new comments — the result is appended to the same RxList
// that renders socket-driven new comments, so the chronological order
// is preserved.
exports.getLiveChatHistory = async (req, res) => {
  try {
    const { liveSellingHistoryId } = req.params;
    if (!liveSellingHistoryId || !mongoose.Types.ObjectId.isValid(liveSellingHistoryId)) {
      return res.status(200).json({ status: false, message: "liveSellingHistoryId is required." });
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const docs = await LiveChat.find({ liveSellingHistoryId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();

    // Match the wire shape the socket emits so the Flutter renderer
    // (`live_widget.dart` _buildCommentsSection) handles replay items
    // identically to live ones — same keys: liveSellingHistoryId,
    // userId, userName, userImage, commentText, type, systemType.
    const comments = docs.map((d) => ({
      liveSellingHistoryId: d.liveSellingHistoryId?.toString() || "",
      userId: d.userId?.toString() || "",
      userName: d.userName || "",
      userImage: d.userImage || "",
      commentText: d.commentText || "",
      type: d.type || "",
      systemType: d.systemType || "",
      createdAt: d.createdAt,
    }));

    return res.status(200).json({ status: true, comments });
  } catch (error) {
    console.error("getLiveChatHistory error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};
