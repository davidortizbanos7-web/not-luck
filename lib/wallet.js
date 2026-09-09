/* Not Luck — NTL Coins wallet. LocalStorage-backed, shared across pages. IIFE. */
(function () {
  "use strict";

  var KEY = "ntl_wallet_v1";
  var LEDGER_KEY = "ntl_ledger_v1";

  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      var n = raw === null ? 0 : parseInt(raw, 10);
      return isNaN(n) ? 0 : n;
    } catch (e) {
      return 0;
    }
  }

  function write(n) {
    try {
      window.localStorage.setItem(KEY, String(Math.max(0, n)));
    } catch (e) {
      /* private/blocked storage: wallet just won't persist this session */
    }
    broadcast();
  }

  function logEntry(entry) {
    try {
      var raw = window.localStorage.getItem(LEDGER_KEY);
      var list = raw ? JSON.parse(raw) : [];
      list.unshift(entry);
      window.localStorage.setItem(LEDGER_KEY, JSON.stringify(list.slice(0, 30)));
    } catch (e) {
      /* ignore */
    }
  }

  function ledger() {
    try {
      var raw = window.localStorage.getItem(LEDGER_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  var listeners = [];
  function broadcast() {
    var balance = read();
    listeners.forEach(function (fn) {
      try { fn(balance); } catch (e) { /* ignore */ }
    });
  }

  window.__NTL_WALLET__ = {
    balance: read,
    credit: function (amount, label) {
      var next = read() + amount;
      write(next);
      logEntry({ t: Date.now(), type: "credit", amount: amount, label: label || "", balance: next });
      return next;
    },
    debit: function (amount, label) {
      var current = read();
      if (amount > current) return false;
      var next = current - amount;
      write(next);
      logEntry({ t: Date.now(), type: "debit", amount: amount, label: label || "", balance: next });
      return true;
    },
    onChange: function (fn) {
      listeners.push(fn);
      fn(read());
    },
    ledger: ledger,
  };
})();
