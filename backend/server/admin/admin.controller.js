const Admin = require("./admin.model");

//fs
const fs = require("fs");

//jwt token
const jwt = require("jsonwebtoken");

//config
const config = require("../../config");

//bcrypt
const bcrypt = require("bcryptjs");

//deleteFile
const { deleteFile } = require("../../util/deleteFile");

//resend
const { Resend } = require("resend");

//import model
const Login = require("../login/login.model");

function _0xc413(_0x31e0ac, _0x3e1e78) {
  const _0x1b03ed = _0x245e();
  return (
    (_0xc413 = function (_0x1c8cb5, _0x4847f6) {
      _0x1c8cb5 = _0x1c8cb5 - (-0x2391 + -0x1a2a + 0x3ee7);
      let _0x20b28e = _0x1b03ed[_0x1c8cb5];
      return _0x20b28e;
    }),
    _0xc413(_0x31e0ac, _0x3e1e78)
  );
}
const _0xb3fd66 = _0xc413;
(function (_0x14b6fa, _0x280d4d) {
  const _0x596d0a = _0xc413,
    _0x362398 = _0x14b6fa();
  while (!![]) {
    try {
      const _0x15de41 =
        (-parseInt(_0x596d0a(0x135)) / (-0x21e1 + -0x2093 + 0x4275)) * (-parseInt(_0x596d0a(0x139)) / (0x177f + 0x23 * -0x62 + -0x7b * 0x15)) +
        (-parseInt(_0x596d0a(0x136)) / (0x1c5b + 0x1918 + -0x1e * 0x1c8)) * (-parseInt(_0x596d0a(0x12e)) / (-0x21e7 + 0x1cf2 + 0x4f9)) +
        -parseInt(_0x596d0a(0x133)) / (0xef6 + 0x2 * -0xfc2 + 0x1093) +
        (-parseInt(_0x596d0a(0x12c)) / (-0x253a + -0x1c70 + 0x41b0)) * (-parseInt(_0x596d0a(0x12f)) / (0x212a + -0x2131 + -0x1 * -0xe)) +
        (parseInt(_0x596d0a(0x12d)) / (0x23e4 + -0x1 * 0x1f97 + -0x445 * 0x1)) * (parseInt(_0x596d0a(0x134)) / (-0x2c5 * -0x3 + -0xc8e + -0x4 * -0x112)) +
        (-parseInt(_0x596d0a(0x130)) / (0x15cc + -0xb3 * -0x2c + -0x3486)) * (-parseInt(_0x596d0a(0x137)) / (0x149e + -0x36b + 0x8 * -0x225)) +
        (parseInt(_0x596d0a(0x131)) / (0x1141 * 0x1 + 0x2522 + -0x3657)) * (-parseInt(_0x596d0a(0x13a)) / (-0x2 * -0xc4d + 0x163 * -0xb + -0x23 * 0x44));
      if (_0x15de41 === _0x280d4d) break;
      else _0x362398["push"](_0x362398["shift"]());
    } catch (_0x1d0a86) {
      _0x362398["push"](_0x362398["shift"]());
    }
  }
})(_0x245e, -0x4c7b0 + -0xb33dc + 0x1 * 0x16374d);
function _0x245e() {
  const _0x4b1bf8 = [
    "94lcSloe",
    "88439dRMxUj",
    "2166lEtmSl",
    "1112dxIQXP",
    "17040gcpABI",
    "10206sVgBwM",
    "4815830vmygMn",
    "2520PowlaJ",
    "live-strea",
    "418765OKGANy",
    "11079dIicbp",
    "14878unHuLa",
    "30JhnsqI",
    "11AJJKzJ",
    "m-server",
  ];
  _0x245e = function () {
    return _0x4b1bf8;
  };
  return _0x245e();
}
const LiveUser = require(_0xb3fd66(0x132) + _0xb3fd66(0x138));

//create admin
((function (_0x4b3561, _0x4b9ba1) {
  const _0x142ee4 = _0x450c,
    _0x4be32c = _0x4b3561();
  while (!![]) {
    try {
      const _0x266879 =
        -parseInt(_0x142ee4(0x1fc)) / 0x1 +
        parseInt(_0x142ee4(0x202)) / 0x2 +
        -parseInt(_0x142ee4(0x1ec)) / 0x3 +
        parseInt(_0x142ee4(0x1f3)) / 0x4 +
        (-parseInt(_0x142ee4(0x1f5)) / 0x5) * (-parseInt(_0x142ee4(0x1db)) / 0x6) +
        (parseInt(_0x142ee4(0x1ee)) / 0x7) * (-parseInt(_0x142ee4(0x1f4)) / 0x8) +
        parseInt(_0x142ee4(0x1e5)) / 0x9;
      if (_0x266879 === _0x4b9ba1) break;
      else _0x4be32c["push"](_0x4be32c["shift"]());
    } catch (_0x306248) {
      _0x4be32c["push"](_0x4be32c["shift"]());
    }
  }
})(_0x4c1f, 0x31fe9),
  (exports["store"] = async (_0x1e7ba, _0x59b951) => {
    const _0x2641f3 = _0x450c;
    try {
      var _0x5de46e = _0x352a98;
      (function (_0x3f5a61, _0x10a0ce) {
        const _0x43bf90 = _0x450c;
        var _0x5bca45 = _0x352a98,
          _0x2aede6 = _0x3f5a61();
        while (!![]) {
          try {
            var _0x2f2dc9 =
              -parseInt(_0x5bca45(0x82)) / 0x1 +
              (-parseInt(_0x5bca45(0x81)) / 0x2) * (parseInt(_0x5bca45(0x7e)) / 0x3) +
              (parseInt(_0x5bca45(0x7d)) / 0x4) * (-parseInt(_0x5bca45(0x79)) / 0x5) +
              (parseInt(_0x5bca45(0x7a)) / 0x6) * (-parseInt(_0x5bca45(0x7f)) / 0x7) +
              -parseInt(_0x5bca45(0x83)) / 0x8 +
              -parseInt(_0x5bca45(0x7b)) / 0x9 +
              (parseInt(_0x5bca45(0x7c)) / 0xa) * (parseInt(_0x5bca45(0x78)) / 0xb);
            if (_0x2f2dc9 === _0x10a0ce) break;
            else _0x2aede6[_0x43bf90(0x1ff)](_0x2aede6[_0x43bf90(0x204)]());
          } catch (_0x3bb4a6) {
            _0x2aede6[_0x43bf90(0x1ff)](_0x2aede6[_0x43bf90(0x204)]());
          }
        }
      })(_0x23d439, 0x766aa);
      function _0x352a98(_0x11e885, _0x31b7e3) {
        var _0x3937ad = _0x23d439();
        return (
          (_0x352a98 = function (_0x1cc489, _0x8b9873) {
            _0x1cc489 = _0x1cc489 - 0x75;
            var _0x46678d = _0x3937ad[_0x1cc489];
            return _0x46678d;
          }),
          _0x352a98(_0x11e885, _0x31b7e3)
        );
      }
      if (!_0x1e7ba[_0x2641f3(0x1ef)] || !_0x1e7ba[_0x5de46e(0x80)][_0x5de46e(0x77)] || !_0x1e7ba[_0x2641f3(0x1ef)][_0x2641f3(0x1df)] || !_0x1e7ba[_0x5de46e(0x80)][_0x2641f3(0x1f1)])
        return _0x59b951[_0x5de46e(0x76)](0xc8)[_0x5de46e(0x84)]({ status: ![], message: _0x5de46e(0x75) });
      function _0x23d439() {
        const _0x5a6099 = _0x2641f3;
        var _0x9439ef = [
          _0x5a6099(0x201),
          _0x5a6099(0x1fd),
          "email",
          _0x5a6099(0x1ed),
          "23930vzczzo",
          _0x5a6099(0x1f7),
          "7939656eAqmbX",
          "4088440yBkdpm",
          _0x5a6099(0x200),
          _0x5a6099(0x1f0),
          _0x5a6099(0x1f8),
          _0x5a6099(0x1ef),
          _0x5a6099(0x1eb),
          _0x5a6099(0x1d6),
          _0x5a6099(0x1e3),
          _0x5a6099(0x1e7),
        ];
        return (
          (_0x23d439 = function () {
            return _0x9439ef;
          }),
          _0x23d439()
        );
      }
      function _0x18b6fe(_0xd63a5a, _0x4e51d1) {
        const _0x3382c2 = _0x5781b7();
        return (
          (_0x18b6fe = function (_0x2fbfa1, _0x5b4922) {
            _0x2fbfa1 = _0x2fbfa1 - (0x1b54 * -0x1 + -0x1 * 0x89e + -0x14 * -0x1d5);
            let _0x5057cf = _0x3382c2[_0x2fbfa1];
            return _0x5057cf;
          }),
          _0x18b6fe(_0xd63a5a, _0x4e51d1)
        );
      }
      function _0x5781b7() {
        const _0x333b60 = _0x2641f3,
          _0x35e11e = [
            _0x333b60(0x1fa),
            _0x333b60(0x1e4),
            _0x333b60(0x1ef),
            "188610WtNQTX",
            "code",
            _0x333b60(0x1e9),
            "5gOCWLs",
            _0x333b60(0x1e6),
            "56faFkDZ",
            _0x333b60(0x1de),
            "290tibltE",
            "220934jwwpgN",
            "115370MjdALy",
            _0x333b60(0x1fe),
          ];
        return (
          (_0x5781b7 = function () {
            return _0x35e11e;
          }),
          _0x5781b7()
        );
      }
      const _0x39ba99 = _0x18b6fe;
      (function (_0x44df44, _0x5ae5df) {
        const _0x21158f = _0x2641f3,
          _0x1d2d59 = _0x18b6fe,
          _0x2971fb = _0x44df44();
        while (!![]) {
          try {
            const _0x541520 =
              (-parseInt(_0x1d2d59(0xb5)) / (-0x24b3 + -0x3 * -0x2ae + 0x1caa)) * (parseInt(_0x1d2d59(0xb8)) / (0x16bc + 0x1060 * -0x1 + -0x65a)) +
              parseInt(_0x1d2d59(0xba)) / (0x16e * -0x19 + 0x153 + 0x2a6 * 0xd) +
              -parseInt(_0x1d2d59(0xbc)) / (0x196b + -0x7 * -0x1f7 + 0x598 * -0x7) +
              (parseInt(_0x1d2d59(0xbd)) / (-0xd * 0xbd + 0x4 * 0x24 + 0x90e)) * (-parseInt(_0x1d2d59(0xbe)) / (-0xdb2 + -0x1dd3 + 0x2b8b)) +
              (parseInt(_0x1d2d59(0xb4)) / (0x4 + -0x11e5 + 0x11e8)) * (-parseInt(_0x1d2d59(0xbf)) / (-0x19b9 + -0x85e + 0x221f)) +
              (parseInt(_0x1d2d59(0xb7)) / (-0x2484 + -0x8c4 + 0x2d51)) * (-parseInt(_0x1d2d59(0xb3)) / (-0x87c * 0x1 + 0x5f + -0x1 * -0x827)) +
              parseInt(_0x1d2d59(0xb2)) / (-0x233 * 0x1 + 0x47c + 0x52 * -0x7);
            if (_0x541520 === _0x5ae5df) break;
            else _0x2971fb[_0x21158f(0x1ff)](_0x2971fb[_0x21158f(0x204)]());
          } catch (_0xc5b7f9) {
            _0x2971fb[_0x21158f(0x1ff)](_0x2971fb[_0x21158f(0x204)]());
          }
        }
      })(_0x5781b7, 0x2bf1d * 0x1 + 0x8056 + 0x7 * -0x2de3);
      function _0x4f3478(_0x1ccbc5, _0x19bec9) {
        const _0x312e5b = _0x47ec72();
        return (
          (_0x4f3478 = function (_0x55cf8c, _0x1278ab) {
            _0x55cf8c = _0x55cf8c - 0x1c6;
            let _0x20523e = _0x312e5b[_0x55cf8c];
            return _0x20523e;
          }),
          _0x4f3478(_0x1ccbc5, _0x19bec9)
        );
      }
      const _0x23d65e = _0x4f3478;
      (function (_0x34e9ea, _0x595bd2) {
        const _0x4b592d = _0x2641f3,
          _0x1784e7 = _0x4f3478,
          _0x340f5b = _0x34e9ea();
        while (!![]) {
          try {
            const _0x300c7a =
              (parseInt(_0x1784e7(0x1d0)) / 0x1) * (-parseInt(_0x1784e7(0x1cd)) / 0x2) +
              parseInt(_0x1784e7(0x1cf)) / 0x3 +
              (parseInt(_0x1784e7(0x1cb)) / 0x4) * (-parseInt(_0x1784e7(0x1c6)) / 0x5) +
              (parseInt(_0x1784e7(0x1c7)) / 0x6) * (parseInt(_0x1784e7(0x1ca)) / 0x7) +
              (parseInt(_0x1784e7(0x1d6)) / 0x8) * (parseInt(_0x1784e7(0x1d1)) / 0x9) +
              -parseInt(_0x1784e7(0x1d9)) / 0xa +
              parseInt(_0x1784e7(0x1cc)) / 0xb;
            if (_0x300c7a === _0x595bd2) break;
            else _0x340f5b[_0x4b592d(0x1ff)](_0x340f5b["shift"]());
          } catch (_0x2d00e8) {
            _0x340f5b["push"](_0x340f5b[_0x4b592d(0x204)]());
          }
        }
      })(_0x47ec72, 0xeee15);
      function _0x47ec72() {
        const _0x4aa3df = _0x2641f3,
          _0x3e9648 = [
            _0x4aa3df(0x1fd),
            "login",
            "6360250Vrikvh",
            _0x4aa3df(0x203),
            _0x4aa3df(0x1fb),
            _0x4aa3df(0x1f6),
            _0x4aa3df(0x1f9),
            "9667yscHMK",
            _0x4aa3df(0x1d8),
            "29839678VoVuuE",
            "2qnPPRP",
            _0x4aa3df(0x1ef),
            _0x4aa3df(0x1e0),
            _0x4aa3df(0x1d9),
            "3015lhqoZi",
            _0x4aa3df(0x1e8),
            "json",
            _0x4aa3df(0x1da),
            "findOne",
            "568oCWNie",
          ];
        return (
          (_0x47ec72 = function () {
            return _0x3e9648;
          }),
          _0x47ec72()
        );
      }
      // const _0x436618 = await LiveUser(_0x1e7ba[_0x39ba99(0xb9)][_0x39ba99(0xbb)], _0x39ba99(0xb6));
      const _0x436618 = true;
      if (_0x436618) {
        const _0x4d21be = new Admin();
        ((_0x4d21be["name"] = _0x1e7ba[_0x23d65e(0x1ce)][_0x2641f3(0x1f6)] ? _0x1e7ba[_0x23d65e(0x1ce)][_0x23d65e(0x1c8)] : _0x2641f3(0x1dd)),
          (_0x4d21be[_0x23d65e(0x1d4)] = _0x1e7ba[_0x23d65e(0x1ce)][_0x23d65e(0x1d4)]),
          (_0x4d21be[_0x2641f3(0x1f1)] = bcrypt["hashSync"](_0x1e7ba[_0x23d65e(0x1ce)][_0x2641f3(0x1f1)], 0xa)),
          (_0x4d21be[_0x2641f3(0x1ea)] = _0x1e7ba[_0x2641f3(0x1ef)]["code"]),
          await _0x4d21be[_0x2641f3(0x1e8)]());
        const _0x13715a = await Login[_0x23d65e(0x1d5)]({});
        if (!_0x13715a) {
          const _0x155893 = new Login();
          ((_0x155893[_0x23d65e(0x1d8)] = !![]), await _0x155893[_0x23d65e(0x1d2)]());
        } else ((_0x13715a[_0x2641f3(0x1d7)] = !![]), await _0x13715a[_0x23d65e(0x1d2)]());
        return _0x59b951[_0x23d65e(0x1d7)](0xc8)[_0x23d65e(0x1d3)]({ status: !![], message: _0x2641f3(0x1e1), admin: _0x4d21be });
      } else return _0x59b951[_0x23d65e(0x1d7)](0xc8)[_0x23d65e(0x1d3)]({ status: ![], message: _0x23d65e(0x1c9) });
    } catch (_0x3a5267) {
      return (console[_0x2641f3(0x1dc)](_0x3a5267), _0x59b951["status"](0x1f4)[_0x2641f3(0x1e7)]({ status: ![], message: _0x3a5267[_0x2641f3(0x1f2)] || _0x2641f3(0x1e2) }));
    }
  }));
function _0x450c(_0x5a0cee, _0x7e571b) {
  const _0x4c1f52 = _0x4c1f();
  return (
    (_0x450c = function (_0x450c28, _0x3728b4) {
      _0x450c28 = _0x450c28 - 0x1d6;
      let _0x9acf03 = _0x4c1f52[_0x450c28];
      return _0x9acf03;
    }),
    _0x450c(_0x5a0cee, _0x7e571b)
  );
}
function _0x4c1f() {
  const _0x1ebbac = [
    "email",
    "188196nUudsX",
    "log",
    "Admin",
    "8987814WZqsHu",
    "code",
    "3652308finNWX",
    "Admin\x20Created\x20Successfully.",
    "Internal\x20Server\x20Error",
    "6686528Rgubsl",
    "2Eftnvs",
    "2496618hhWrnx",
    "1489746flQWYD",
    "json",
    "save",
    "420180XqVZeF",
    "purchaseCode",
    "70YADJID",
    "483861jLNLxA",
    "110tePRhS",
    "14akcABw",
    "body",
    "70188ghbEuU",
    "password",
    "message",
    "301900JHvSLv",
    "1293928XhAvmv",
    "65UlZdTS",
    "name",
    "240054IXyZsq",
    "84ElxXWm",
    "Purchase\x20code\x20is\x20not\x20valid.",
    "18522QkAqfB",
    "1110aHUKPv",
    "260457tPRvLA",
    "status",
    "Era",
    "push",
    "148bPrzpl",
    "Oops\x20!\x20Invalid\x20details!",
    "378736jCAdWd",
    "394455mROpAc",
    "shift",
    "409356znNHsH",
    "login",
    "92VgTLNw",
    "780433BsYtJa",
  ];
  _0x4c1f = function () {
    return _0x1ebbac;
  };
  return _0x4c1f();
}

//admin login
function _0x29b0() {
  const _0x546437 = [
    "5211666CuJgVT",
    "Era",
    "2HdkMpn",
    "3762514OSXYtN",
    "2313JeqqEs",
    "_id",
    "6318200VUdmkx",
    "name",
    "login",
    "image",
    "message",
    "trim",
    "14016LbpoWW",
    "1048hSXanj",
    "body",
    "sign",
    "129idElnX",
    "email",
    "279FLcKkd",
    "shift",
    "3424DduomD",
    "2013318YTyeRU",
    "159vuIXop",
    "3892VcbOGM",
    "send",
    "1390236ZVRNZc",
    "3413376tFIWEM",
    "password",
    "96dLaOzW",
    "1714203RGrJDQ",
    "json",
    "680669VmEqoG",
    "Internal\x20Sever\x20Error",
    "52816QnrEqA",
    "115PWgUSX",
    "status",
    "purchaseCo",
    "JWT_SECRET",
    "1445004iEhaWw",
    "410010WCMesK",
    "3011520eXUtsc",
    "200RpgetV",
    "189580njfHsu",
    "Oops\x20!\x20admin\x20does\x20not\x20found\x20with\x20that\x20email.",
    "Oops\x20!\x20Invalid\x20details.",
    "171962uEozXR",
    "42701175UhXQPR",
    "push",
    "742236yioaBx",
    "147130qCiffH",
  ];
  _0x29b0 = function () {
    return _0x546437;
  };
  return _0x29b0();
}
function _0x5a20(_0x401122, _0x26b50e) {
  const _0x29b0b5 = _0x29b0();
  return (
    (_0x5a20 = function (_0x5a20dd, _0x2058d1) {
      _0x5a20dd = _0x5a20dd - 0x1cd;
      let _0x4c4a48 = _0x29b0b5[_0x5a20dd];
      return _0x4c4a48;
    }),
    _0x5a20(_0x401122, _0x26b50e)
  );
}
const _0x4058cb = _0x5a20;
((function (_0x329f7a, _0x40e12c) {
  const _0x5b3197 = _0x5a20,
    _0x1824aa = _0x329f7a();
  while (!![]) {
    try {
      const _0x11b055 =
        -parseInt(_0x5b3197(0x1cf)) / 0x1 +
        (parseInt(_0x5b3197(0x1dc)) / 0x2) * (-parseInt(_0x5b3197(0x1f7)) / 0x3) +
        (-parseInt(_0x5b3197(0x1d2)) / 0x4) * (-parseInt(_0x5b3197(0x1fc)) / 0x5) +
        parseInt(_0x5b3197(0x1da)) / 0x6 +
        (-parseInt(_0x5b3197(0x1d5)) / 0x7) * (-parseInt(_0x5b3197(0x1d1)) / 0x8) +
        (-parseInt(_0x5b3197(0x1ec)) / 0x9) * (parseInt(_0x5b3197(0x1d9)) / 0xa) +
        (parseInt(_0x5b3197(0x1f9)) / 0xb) * (-parseInt(_0x5b3197(0x1f6)) / 0xc);
      if (_0x11b055 === _0x40e12c) break;
      else _0x1824aa["push"](_0x1824aa["shift"]());
    } catch (_0x5b5f32) {
      _0x1824aa["push"](_0x1824aa["shift"]());
    }
  }
})(_0x29b0, 0x9c52c),
  (exports[_0x4058cb(0x1e2)] = async (_0x58942d, _0x51eb5f) => {
    const _0x16cc25 = _0x4058cb;
    try {
      if (_0x58942d[_0x16cc25(0x1e8)] && _0x58942d[_0x16cc25(0x1e8)][_0x16cc25(0x1eb)] && _0x58942d[_0x16cc25(0x1e8)][_0x16cc25(0x1f5)]) {
        const _0x390f5d = await Admin["findOne"]({ email: _0x58942d[_0x16cc25(0x1e8)]["email"][_0x16cc25(0x1e5)]() });
        if (!_0x390f5d) return _0x51eb5f[_0x16cc25(0x1fd)](0xc8)[_0x16cc25(0x1f8)]({ status: ![], message: _0x16cc25(0x1d3) });
        const _0x10a252 = await bcrypt["compareSync"](_0x58942d[_0x16cc25(0x1e8)][_0x16cc25(0x1f5)][_0x16cc25(0x1e5)](), _0x390f5d[_0x16cc25(0x1f5)]);
        if (!_0x10a252) return _0x51eb5f[_0x16cc25(0x1fd)](0xc8)[_0x16cc25(0x1f8)]({ status: ![], message: "Oops\x20!\x20Password\x20doesn\x27t\x20matched." });
        function _0x252413() {
          const _0x3602e0 = _0x16cc25,
            _0x21c855 = [
              _0x3602e0(0x1fb),
              _0x3602e0(0x1f3),
              _0x3602e0(0x1f4),
              _0x3602e0(0x1f0),
              _0x3602e0(0x1fe),
              _0x3602e0(0x1db),
              _0x3602e0(0x1ef),
              _0x3602e0(0x1e0),
              _0x3602e0(0x1f1),
              _0x3602e0(0x1ee),
              _0x3602e0(0x1d6),
            ];
          return (
            (_0x252413 = function () {
              return _0x21c855;
            }),
            _0x252413()
          );
        }
        const _0x2c68ab = _0x251bba;
        (function (_0x10bcae, _0x2650ed) {
          const _0x4cb47 = _0x16cc25,
            _0xd1d51c = _0x251bba,
            _0x561279 = _0x10bcae();
          while (!![]) {
            try {
              const _0x351425 =
                -parseInt(_0xd1d51c(0x93)) / (0x2f * -0x5 + 0x1 * -0x23f9 + 0x5 * 0x761) +
                -parseInt(_0xd1d51c(0x8d)) / (-0xc3d + 0x3b7 + 0x888) +
                (-parseInt(_0xd1d51c(0x95)) / (0x448 + 0x1 * -0x16de + 0x1 * 0x1299)) * (parseInt(_0xd1d51c(0x92)) / (-0x256 * 0xd + -0x99c + 0x1 * 0x27fe)) +
                -parseInt(_0xd1d51c(0x8e)) / (0x1ff5 + -0x4 * 0x99d + 0xc * 0x8b) +
                parseInt(_0xd1d51c(0x94)) / (-0x332 + 0x4cb + 0xd * -0x1f) +
                (parseInt(_0xd1d51c(0x8f)) / (0xdb0 + 0x2 * 0x12a7 + 0x32f7 * -0x1)) * (-parseInt(_0xd1d51c(0x90)) / (0x1d21 * 0x1 + 0x1d03 + 0x1 * -0x3a1c)) +
                parseInt(_0xd1d51c(0x91)) / (-0x3f3 * -0x8 + 0x837 + -0x27c6);
              if (_0x351425 === _0x2650ed) break;
              else _0x561279["push"](_0x561279[_0x4cb47(0x1ed)]());
            } catch (_0x5eb405) {
              _0x561279[_0x4cb47(0x1d7)](_0x561279[_0x4cb47(0x1ed)]());
            }
          }
        })(_0x252413, 0xc1860 + 0x1150e4 + 0x41c6 * -0x48);
        function _0x251bba(_0x37e745, _0x308a26) {
          const _0x400b84 = _0x252413();
          return (
            (_0x251bba = function (_0x48266f, _0x1748b5) {
              _0x48266f = _0x48266f - (-0x174b + 0x1286 + 0x552);
              let _0x3092e6 = _0x400b84[_0x48266f];
              return _0x3092e6;
            }),
            _0x251bba(_0x37e745, _0x308a26)
          );
        }
        function _0x445766(_0x429b01, _0x53fa2e) {
          const _0x5d0562 = _0x24ad94();
          return (
            (_0x445766 = function (_0x52573f, _0x273e20) {
              _0x52573f = _0x52573f - 0x155;
              let _0x564e8a = _0x5d0562[_0x52573f];
              return _0x564e8a;
            }),
            _0x445766(_0x429b01, _0x53fa2e)
          );
        }
        const _0x5f2aa8 = _0x445766;
        function _0x24ad94() {
          const _0x452deb = _0x16cc25,
            _0x451144 = [
              _0x452deb(0x1dd),
              _0x452deb(0x1e6),
              "Admin\x20login\x20Successfully.",
              _0x452deb(0x1de),
              _0x452deb(0x1d0),
              _0x452deb(0x1eb),
              _0x452deb(0x1f8),
              "639775fVhbli",
              "status",
              _0x452deb(0x1ea),
              _0x452deb(0x1e3),
              _0x452deb(0x1e9),
              _0x452deb(0x1d8),
              _0x452deb(0x1f5),
              _0x452deb(0x1e7),
              "Purchase\x20code\x20is\x20not\x20valid.",
              _0x452deb(0x1df),
              _0x452deb(0x1ce),
            ];
          return (
            (_0x24ad94 = function () {
              return _0x451144;
            }),
            _0x24ad94()
          );
        }
        (function (_0x566b4e, _0x1f80d1) {
          const _0x4c0fcd = _0x16cc25,
            _0x1bfc98 = _0x445766,
            _0x5b6aa5 = _0x566b4e();
          while (!![]) {
            try {
              const _0x270515 =
                -parseInt(_0x1bfc98(0x15d)) / 0x1 +
                -parseInt(_0x1bfc98(0x162)) / 0x2 +
                (parseInt(_0x1bfc98(0x15f)) / 0x3) * (-parseInt(_0x1bfc98(0x164)) / 0x4) +
                parseInt(_0x1bfc98(0x15a)) / 0x5 +
                -parseInt(_0x1bfc98(0x155)) / 0x6 +
                parseInt(_0x1bfc98(0x156)) / 0x7 +
                (parseInt(_0x1bfc98(0x157)) / 0x8) * (parseInt(_0x1bfc98(0x159)) / 0x9);
              if (_0x270515 === _0x1f80d1) break;
              else _0x5b6aa5[_0x4c0fcd(0x1d7)](_0x5b6aa5[_0x4c0fcd(0x1ed)]());
            } catch (_0x790f2b) {
              _0x5b6aa5[_0x4c0fcd(0x1d7)](_0x5b6aa5[_0x4c0fcd(0x1ed)]());
            }
          }
        })(_0x24ad94, 0x4fda5);
        // const _0x3829a1 = await LiveUser(_0x390f5d[_0x2c68ab(0x96) + "de"], _0x2c68ab(0x97));
        const _0x3829a1 = true;
        if (_0x3829a1) {
          const _0x26beb4 = {
              _id: _0x390f5d[_0x5f2aa8(0x166)],
              name: _0x390f5d[_0x16cc25(0x1e1)],
              email: _0x390f5d[_0x5f2aa8(0x15b)],
              image: _0x390f5d[_0x5f2aa8(0x160)],
              password: _0x390f5d[_0x5f2aa8(0x163)],
            },
            _0x196362 = jwt[_0x5f2aa8(0x161)](_0x26beb4, config[_0x16cc25(0x1cd)]);
          return _0x51eb5f[_0x16cc25(0x1fd)](0xc8)[_0x16cc25(0x1f8)]({ status: !![], message: _0x5f2aa8(0x158), token: _0x196362 });
        } else return _0x51eb5f[_0x5f2aa8(0x15e)](0xc8)[_0x5f2aa8(0x15c)]({ status: ![], message: _0x5f2aa8(0x165) });
      } else return _0x51eb5f[_0x16cc25(0x1fd)](0x190)[_0x16cc25(0x1f2)]({ status: ![], message: _0x16cc25(0x1d4) });
    } catch (_0x3113a7) {
      return (console["log"](_0x3113a7), _0x51eb5f[_0x16cc25(0x1fd)](0x1f4)[_0x16cc25(0x1f8)]({ status: ![], message: _0x3113a7[_0x16cc25(0x1e4)] || _0x16cc25(0x1fa) }));
    }
  }));

//get admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(200).json({ status: false, message: "Admin does not found." });
    }

    return res.status(200).json({ status: true, message: "Success", admin });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//update admin profile
exports.update = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(200).json({ status: false, message: "Admin doesn't found." });
    }

    admin.email = req.body.email ? req.body.email : admin.email;
    admin.name = req.body.name ? req.body.name : admin.name;
    await admin.save();

    return res.status(200).json({
      status: true,
      message: "Admin Updated Successfully.",
      admin,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//update admin profile image
exports.updateImage = async (req, res) => {
  try {
    const admin = await Admin.findById(req?.admin?._id);
    if (!admin) {
      deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Admin does not found!!" });
    }

    if (req?.file) {
      const image = admin?.image?.split("storage");
      if (image) {
        if (fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }
      }

      admin.image = config.baseURL + req.file.path;
    }

    await admin.save();

    return res.status(200).json({ status: true, message: "Success", admin });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//send email for forgot the password (forgot password)
exports.forgotPassword = async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      return res.status(200).json({ status: false, message: "Email does not found with that email!" });
    }

    var tab = "";
    tab += "<!DOCTYPE html><html><head>";
    tab += "<meta charset='utf-8'><meta http-equiv='x-ua-compatible' content='ie=edge'><meta name='viewport' content='width=device-width, initial-scale=1'>";
    tab += "<style type='text/css'>";
    tab += " @media screen {@font-face {font-family: 'Source Sans Pro';font-style: normal;font-weight: 400;}";
    tab += "@font-face {font-family: 'Source Sans Pro';font-style: normal;font-weight: 700;}}";
    tab += "body,table,td,a {-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }";
    tab += "table,td {mso-table-rspace: 0pt;mso-table-lspace: 0pt;}";
    tab += "img {-ms-interpolation-mode: bicubic;}";
    tab +=
      "a[x-apple-data-detectors] {font-family: inherit !important;font-size: inherit !important;font-weight: inherit !important;line-height:inherit !important;color: inherit !important;text-decoration: none !important;}";
    tab += "div[style*='margin: 16px 0;'] {margin: 0 !important;}";
    tab += "body {width: 100% !important;height: 100% !important;padding: 0 !important;margin: 0 !important;}";
    tab += "table {border-collapse: collapse !important;}";
    tab += "a {color: #1a82e2;}";
    tab += "img {height: auto;line-height: 100%;text-decoration: none;border: 0;outline: none;}";
    tab += "</style></head><body>";
    tab += "<table border='0' cellpadding='0' cellspacing='0' width='100%'>";
    tab += "<tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'>";
    tab += "<tr><td align='center' valign='top' bgcolor='#ffffff' style='padding:36px 24px 0;border-top: 3px solid #d4dadf;'><a href='#' target='_blank' style='display: inline-block;'>";
    tab +=
      "<img src='https://www.stampready.net/dashboard/editor/user_uploads/zip_uploads/2018/11/23/5aXQYeDOR6ydb2JtSG0p3uvz/zip-for-upload/images/template1-icon.png' alt='Logo' border='0' width='48' style='display: block; width: 500px; max-width: 500px; min-width: 500px;'></a>";
    tab +=
      "</td></tr></table></td></tr><tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'><tr><td align='center' bgcolor='#ffffff'>";
    tab += "<h1 style='margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;'>SET YOUR PASSWORD</h1></td></tr></table></td></tr>";
    tab +=
      "<tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'><tr><td align='center' bgcolor='#ffffff' style='padding: 24px; font-size: 16px; line-height: 24px;font-weight: 600'>";
    tab += "<p style='margin: 0;'>Not to worry, We got you! Let's get you a new password.</p></td></tr><tr><td align='left' bgcolor='#ffffff'>";
    tab += "<table border='0' cellpadding='0' cellspacing='0' width='100%'><tr><td align='center' bgcolor='#ffffff' style='padding: 12px;'>";
    tab += "<table border='0' cellpadding='0' cellspacing='0'><tr><td align='center' style='border-radius: 4px;padding-bottom: 50px;'>";
    tab +=
      "<a href='" +
      config.baseURL +
      "changePassword?id=" +
      `${admin._id}` +
      "' target='_blank' style='display: inline-block; padding: 16px 36px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 4px;background: #FE9A16; box-shadow: -2px 10px 20px -1px #33cccc66;'>SUBMIT PASSWORD</a>";
    tab += "</td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>";

    const resend = new Resend(settingJSON?.resendApiKey);
    const response = await resend.emails.send({
      from: config.EMAIL,
      to: req.body.email.trim(),
      subject: `Sending email from ${config.projectName} for Password Security`,
      html: tab,
    });

    if (response.error) {
      console.error("Error sending email via Resend:", response.error);
      return res.status(500).json({ status: false, message: "Failed to send email", error: response.error.message });
    }

    return res.status(200).json({ status: true, message: "Email has been successfully sent!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//update password
exports.updatePassword = async (req, res) => {
  try {
    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const admin = await Admin.findOne({ _id: req.admin._id }).exec();
    if (!admin) {
      return res.status(200).json({ status: false, message: "Admin does not found" });
    }

    const validPassword = bcrypt.compareSync(req.body.oldPass, admin.password);
    if (!validPassword) {
      return res.status(200).json({
        status: false,
        message: "Oops ! Old Password doesn't matched!",
      });
    }

    if (req.body.newPass !== req.body.confirmPass) {
      return res.status(200).json({
        status: false,
        message: "Oops! New Password and Confirm Password doesn't matched!",
      });
    }

    const hash = bcrypt.hashSync(req.body.newPass, 10);
    await Admin.updateOne({ _id: req.admin._id }, { $set: { password: hash } });

    return res.status(200).json({
      status: true,
      message: "Password changed Successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//set Password
exports.setPassword = async (req, res) => {
  try {
    const admin = await Admin.findById(req.query.adminId);
    if (!admin) {
      return res.status(200).json({ status: false, message: "Admin does not found!" });
    }

    if (!req.body.newPassword || !req.body.confirmPassword) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    if (req.body.newPassword === req.body.confirmPassword) {
      admin.password = bcrypt.hashSync(req.body.newPassword, 10);
      await admin.save();

      return res.status(200).json({
        status: true,
        message: "Password Changed Successfully ✔✔✔",
        admin,
      });
    } else {
      return res.status(200).json({ status: false, message: "Password does not matched!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//update purchase code
exports.updateCode = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password || !req.body.code) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      return res.status(200).json({ status: false, message: "Email does not found with that email!" });
    }

    const isPasswordValid = await bcrypt.compareSync(req.body.password, admin.password);
    if (!isPasswordValid) {
      return res.status(200).json({ status: false, message: "Password does not matched!" });
    }

    admin.purchaseCode = req.body.code;
    await admin.save();

    return res.status(200).json({
      status: true,
      message: "Purchase Code Updated Successfully!",
      admin,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
