const path = require("path");
const osu = require("node-os-utils");
const { ipcRenderer } = require("electron");
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

let cpuOverload;
let alertFrequency;

//get settings & value

ipcRenderer.on("settings:get", (e, settings) => {
  cpuOverload = +settings.cpuOverload;
  alertFrequency = +settings.alertFrequency;
});
//Run every2 seconds

setInterval(() => {
  //CPU usage:
  cpu.usage().then((info) => {
    document.getElementById("cpu-usage").innerText = info + "%";

    document.getElementById("cpu-progress").style.width = info + "%";

    //Make progress bar red if overload:
    if (info >= cpuOverload) {
      document.getElementById("cpu-progress").style.background = "red";
    } else {
      document.getElementById("cpu-progress").style.background = "#30c88b";
    }

    //Check overload:
    if (info >= cpuOverload && runNotify(alertFrequency)) {
      sendNotifiation({
        title: "CPU Overload",
        body: `CPU is over ${cpuOverload}%`,
        icon: path.join(__dirname, "img", "icon.png"),
      });
    }

    localStorage.setItem("lastNotify", +new Date());
  });

  //CPU free
  cpu.free().then((info) => {
    document.getElementById("cpu-free").innerText = info + "%";
  });
  //uptime
  document.getElementById("sys-uptime").innerText = secondToDhms(os.uptime());
}, 2000);

//set model

document.getElementById("cpu-model").innerText = cpu.model();

//computer name

document.getElementById("comp-name").innerText = os.hostname();

//Os

document.getElementById(
  "os"
).innerText = `${os.type()} | ${os.arch()} Architecture`;

//Total time

mem.info().then((info) => {
  document.getElementById("mem-total").innerText = info.totalMemMb;
});

//Show day ,hour ,mins ,sec

function secondToDhms(second) {
  second = +second;
  const d = Math.floor(second / (3600 * 24));
  const h = Math.floor((second % (3600 * 24)) / 3600);
  const m = Math.floor(second % (3600 * 60));
  const s = Math.floor(second % 60);

  return `${d}d , ${h}h ,${m}m ,${s}s`;
}

function sendNotifiation(options) {
  new Notification(options.title, options);
}

function runNotify(frequency) {
  if (localStorage.getItem("lastNotify") === null) {
    localStorage.setItem("lastNotify", +new Date());
    return true;
  }
  const notifyTime = new Date(parseInt(localStorage.getItem("lastNotify")));
  const now = new Date();
  const difftime = Math.abs(now - notifyTime);
  const minutesPassed = Math.ceil(difftime / (1000 * 6));

  if (minutesPassed > frequency) {
    return true;
  } else {
    return false;
  }
}
