[![works badge](https://cdn.rawgit.com/nikku/works-on-my-machine/v0.2.0/badge.svg?style=flat-square)](https://github.com/nikku/works-on-my-machine)
[![GitHub issues](https://img.shields.io/github/issues/gnehs/PokaPlayer.svg?style=flat-square)](https://github.com/gnehs/PokaPlayer/issues)
[![GitHub forks](https://img.shields.io/github/forks/gnehs/PokaPlayer.svg?style=flat-square)](https://github.com/gnehs/PokaPlayer/network)
[![GitHub stars](https://img.shields.io/github/stars/gnehs/PokaPlayer.svg?style=flat-square)](https://github.com/gnehs/PokaPlayer/stargazers)
[![GitHub license](https://img.shields.io/github/license/gnehs/PokaPlayer.svg?style=flat-square)](https://github.com/gnehs/PokaPlayer/blob/master/LICENSE)
[![GitHub tag (latest Ver)](https://img.shields.io/github/package-json/v/gnehs/PokaPlayer.svg?style=flat-square)](https://github.com/gnehs/PokaPlayer/releases/latest)
[![GitHub repo size in bytes](https://img.shields.io/github/repo-size/gnehs/PokaPlayer.svg?style=flat-square)](https://github.com/gnehs/PokaPlayer/archive/master.zip)
[![Docker Build Status](https://img.shields.io/docker/build/gnehs/pokaplayer.svg?style=flat-square)](https://hub.docker.com/r/gnehs/pokaplayer/)

This Branch contains some different feature compare with official original dev branch.

![](https://i.imgur.com/eOSlvuw.png)

## Feature
* change imgur cdn to improve load speed.
* temporary stop lyric translation.
* temporary stop branch change based on debug config.
## 開始使用

-   使用 Docker 映像來部署 (https://hub.docker.com/r/gnehs/pokaplayer/)
    -   [Synology NAS 教學](https://github.com/gnehs/PokaPlayer/wiki/%E5%A6%82%E4%BD%95%E5%9C%A8-Synology-NAS-%E4%BD%BF%E7%94%A8-Docker-%E9%83%A8%E7%BD%B2-PokaPlayer)
-   或是使用 node.js 來手動啟動
```bash
    npm i
    npm start # 啟動 PokaPlayer
```

## 建議和提示

-   手機建議使用 Chrome
-   Chrome 右上角 `...` 選「加到主畫面」可以有原生 APP 般的體驗
-   **DSM 強烈建議開一個只能播音樂的帳號**
-   该项目采用 mongoDB，在初始配置时格式为 "mongodb://host:port/poka"，若未启用 docker 进行调试，需手动创建 poka 数据库

## 支援的模組

-   [DSM Audio Station](https://www.synology.com/zh-tw/dsm/feature/audio_station)
-   [Netease Cloud Music](https://music.163.com/)
    -   該模組之歌詞轉換功能使用了 [繁化姬](https://zhconvert.org/) 的 API 服務

## 功能

-   釘選項目
-   搜尋
-   專輯
-   最近加入的專輯
-   資料夾
-   演出者
-   作曲者
-   隨機播放
-   密碼保護
-   夜間模式
-   MediaSession

<img src="https://i.imgur.com/GOIe3va.png" width="500px">

## 貢獻者 Contributors

[@gnehs](https://github.com/gnehs)
[@rexx0520](https://github.com/rexx0520)
[@coin3x](https://github.com/coin3x)
[@hang333](https://github.com/hang333)
[@hugwalk](https://github.com/hugwalk)
[@koru1130](https://github.com/koru1130)
