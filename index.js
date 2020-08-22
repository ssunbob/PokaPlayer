const fs = require("fs"); //檔案系統
const jsonfile = require('jsonfile')
const package = require("./package.json"); // package
const { session } = require("./db/db"); // DB
const User = require("./db/user"); // userDB
const pokaLog = require("./log"); // 可愛控制台輸出
const path = require('path');
const git = require("simple-git/promise")(__dirname);
//express
const express = require("express");
const helmet = require("helmet"); // 防範您的應用程式出現已知的 Web 漏洞
const bodyParser = require("body-parser"); // 讀入 post 請求
const app = express(); // Node.js Web 架構
const server = require("http").createServer(app)
const io = require("socket.io").listen(server)
const sharedsession = require("express-socket.io-session");
const exec = require('child_process').exec;
//
// config init
//
let _c = false
if (fs.existsSync("./config.json")) {
    _c = jsonfile.readFileSync("./config.json")
    // sessionSecret
    if (!_c.PokaPlayer.sessionSecret) {
        _c.PokaPlayer.sessionSecret = Math.random().toString(36).substring(7)
    }
    jsonfile.writeFileSync("./config.json", _c, {
        spaces: 4,
        EOL: '\r\n'
    })
}
const config = _c; // 設定檔

// 資料模組
app.use("/pokaapi", require("./dataModule.js"));

// cors for debug
if (config.PokaPlayer.debug) {
    app.use(require('cors')({
        credentials: true,
        origin: 'http://localhost:8080'
    }))
}

// 檢查 branch
// git.raw(["symbolic-ref", "--short", "HEAD"]).then(branch => {
//     branch = branch.slice(0, -1); // 結果會多一個換行符
//     if (branch != (config.PokaPlayer.debug ? "dev" : "master")) {
//         git.fetch(["--all"])
//             .then(() =>
//                 git.reset(["--hard", "origin/" + (config.PokaPlayer.debug ? "dev" : "master")])
//             )
//             .then(() => git.checkout(config.PokaPlayer.debug ? "dev" : "master"))
//             .then(() => process.exit())
//             .catch(err => {
//                 console.error("failed: ", err);
//                 socket.emit("err", err.toString());
//             });
//     }
// });

//
app.use(bodyParser.json());
app.use(express.static("public"))
app.use(helmet())
app.use(session)
io.use(sharedsession(session, {
    autoSave: true
}))

// 時間處理
const moment = require("moment-timezone");
moment.locale("zh-tw");
moment.tz.setDefault("Asia/Taipei");
// 登入
app
    .post("/login/", async (req, res) => {
        let { username, password } = req.body
        let u = await User.login({ username, password })
        if (u.success) {
            req.session.user = u.user
        }
        res.json(u)
    })
    .post("/clear-session/", async (req, res) => {
        let { username, password } = req.body
        let u = await User.login({ username, password })
        if (u.success && await User.isUserAdmin(u.user)) {
            try {
                await require('./db/session').clearAll()
            } catch (e) {
                return res.json({ success: false, e })
            }
            res.json({ success: true })
        } else {
            res.json({ success: false, e: 'Permission Denied Desu' })
        }
    })
    .get("/logout/", (req, res) => {
        // 登出
        req.session.destroy(err => {
            if (err) {
                console.error(err);
            }
            res.clearCookie();
            res.redirect('/');
        });
    })
    .get("/profile/", async (req, res) => {
        let result = await User.getUserById(req.session.user)
        if (result)
            result.password = null
        res.json(result)
    })
    .post("/changeName/", async (req, res) => res.json(await User.changeName(req.session.user, req.body.n)))
    .get("/setting/", async (req, res) => res.json(await User.getSetting(req.session.user)))
    .post("/setting/", async (req, res) => res.json(await User.changeSetting(req.session.user, req.body.n)))
    .post("/changeUsername/", async (req, res) => res.json(await User.changeUsername(req.session.user, req.body.n)))
    .post("/changePassword/", async (req, res) => res.json(await User.changePassword(req.session.user, req.body.oldpassword, req.body.password)))
// 取得狀態
app.get("/status", async (req, res) => {
    res.json({
        login: req.session.user,
        version: req.session.user ? package.version : '0.0.0',
        debug: config.PokaPlayer.debug && req.session.user ? (await git.raw(["rev-parse", "--short", "HEAD"])).slice(0, -1) : false
    })
});
// 更新
app.get("/upgrade", (req, res) => res.send("socket"));

app.use(async (req, res, next) => {
    if (req.session.user && await User.isUserAdmin(req.session.user)) next()
    else res.sendFile(path.join(__dirname + '/public/index.html'))
});
// get info
app.get("/info", async (req, res) => {
    let _p = {}
    _p.version = package.version
    _p.debug = config.PokaPlayer.debug ? (await git.raw(["rev-parse", "--short", "HEAD"])).slice(0, -1) : false
    res.json(_p)
});

app.post("/restart", (req, res) => process.exit());

app.use((req, res, next) => {
    res.sendFile(path.join(__dirname + '/public/index.html'))
});

io.on("connection", socket => {
    socket.emit("hello");
    // Accept a login event with user's data
    socket.on("login", async userdata => {
        let { user } = await User.login(userdata)
        socket.join(user);
        socket.handshake.session.userdata = user;
        socket.handshake.session.save();
    });
    socket.on("logout", () => {
        if (socket.handshake.session.userdata) {
            delete socket.handshake.session.userdata;
            socket.handshake.session.save();
        }
    });
    socket.on('send-nickname', nickname => {
        socket.nickname = nickname;
    });
    // 更新
    socket.on("update", async () => {
        await git.raw(['config', '--global', 'user.email']).then(r => {
            if (r == '\n') {
                git.raw(['config', '--global', 'user.email', 'poka@pokaplayer.poka'])
                git.raw(['config', '--global', 'user.name', 'pokaUpdater'])
            }
        })
        if (await User.isUserAdmin(socket.handshake.session.userdata)) {
            socket.emit("init");
            git.reset(["--hard", "HEAD"])
                .then(() => socket.emit("git", "fetch"))
                .then(() => git.remote(["set-url", "origin", "https://github.com/gnehs/PokaPlayer.git"]))
                .then(() => git.fetch())
                .then(() => git.pull())
                .then(() => socket.emit("git", "reset"))
                .then(() => socket.emit("restart"))
                .then(async () => {
                    const delay = interval => {
                        return new Promise(resolve => {
                            setTimeout(resolve, interval);
                        });
                    };
                    await delay(3000)
                })
                .then(() => process.exit())
                .catch(err => {
                    console.error("failed: ", err);
                    socket.emit("err", err.toString());
                });
        } else {
            socket.emit("err", "Permission Denied Desu");
        }
    });
});
async function pokaStart() {
    // 如果資料庫裡沒有使用者自動建立一個
    async function autoCreateUser() {
        let userlist = await User.getAllUsers()
        if (!userlist || userlist.length <= 0) {
            let username = "poka",
                password = "poka"
            User.create({
                name: "Admin",
                username,
                password,
                role: "admin"
            })
            pokaLog.logDB('init', `已自動建立使用者`)
            pokaLog.logDB('init', `User has been created automatically`)
            pokaLog.logDB('init', `username: ${username}`)
            pokaLog.logDB('init', `password: ${password}`)
        }
    }
    await autoCreateUser()

    // 啟動囉
    server.listen(3000, () => {
        pokaLog.log('PokaPlayer', package.version)
        if (config.PokaPlayer.debug)
            pokaLog.log('INFO', 'Debug Mode')
        pokaLog.log('INFO', 'http://localhost:3000/')
        pokaLog.log('TIME', moment().format("YYYY/MM/DD HH:mm:ss"))
    });
}
module.exports = {
    pokaStart
}