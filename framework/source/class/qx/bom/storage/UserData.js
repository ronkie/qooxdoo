/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

qx.Bootstrap.define("qx.bom.storage.UserData", {
  statics : {
    __local : null,
    __session : null,

    // global id used as key for the storage
    __id : 0,

    getLocal : function() {
      if (this.__local) {
        return this.__local;
      }
      return this.__local = new qx.bom.storage.UserData("local");
    },


    getSession : function() {
      if (this.__session) {
        return this.__session;
      }
      return this.__session = new qx.bom.storage.UserData("session");
    }
  },


  construct : function(storeName) {
    // create a dummy DOM element used for storage
    this.__el = document.createElement("div");
    this.__el.style["display"] = "none";
    document.getElementsByTagName("head")[0].appendChild(this.__el);
    this.__el.addBehavior("#default#userdata");
    this.__storeName = storeName;
    // load the inital data which might be stored
    this.__el.load(this.__storeName);

    // set up the internal reference maps
    this.__storage = {};
    this.__reference = {};

    // initialize
    var value = this.__el.getAttribute("qx" + qx.bom.storage.UserData.__id);
    while (value != undefined) {
      value = qx.lang.Json.parse(value);
      // save the data in the internal storage
      this.__storage[value.key] = value.value;
      // save the reference
      this.__reference[value.key] = "qx" + qx.bom.storage.UserData.__id;
      qx.bom.storage.UserData.__id++;
      value = this.__el.getAttribute("qx" + qx.bom.storage.UserData.__id);
    }
  },


  members : {
    __el : null,
    __storeName : "qxtest",

    // storage which holds the key and the value
    __storage : null,

    // reference store which holds the key and the key used to store
    __reference : null,

    /**
     * @internal
     */
    getStorage : function() {
      return this.__storage;
    },


    getLength : function() {
      return qx.Bootstrap.getKeys(this.__storage).length;
    },


    setItem : function(key, value) {
      // override case
      if (this.__reference[key]) {
        var storageKey = this.__reference[key];
      // new case
      } else {
        var storageKey = "qx" + qx.bom.storage.UserData.__id
        qx.bom.storage.UserData.__id++;
      }

      // build and save the data used to store both, key and value
      var storageValue = qx.lang.Json.stringify({key: key, value: value});
      this.__el.setAttribute(storageKey, storageValue);
      this.__el.save(this.__storeName);

      // also update the internal mappings
      this.__storage[key] = value;
      this.__reference[key] = storageKey;
    },


    getItem : function(key) {
      return this.__storage[key] || null;
    },


    removeItem : function(key) {
      // check if the item is availabel
      var storageName = this.__reference[key];
      if (storageName == undefined) {
        return;
      }

      // remove the item
      this.__el.removeAttribute(storageName);
      // decrease the id because we removed one item
      qx.bom.storage.UserData.__id--;

      // update the internal maps
      delete this.__storage[key];
      delete this.__reference[key];

      // check if we have deleted the last item
      var lastStoreName = "qx" + qx.bom.storage.UserData.__id;
      if (this.__el.getAttribute(lastStoreName)) {
        // if not, move the last item to the deleted spot
        var lastItem = this.__el.getAttribute("qx" + qx.bom.storage.UserData.__id);
        this.__el.removeAttribute(lastStoreName);
        this.__el.setAttribute(storageName, lastItem);

        // update the reference map
        var lastKey = qx.lang.Json.parse(lastItem).key;
        this.__reference[lastKey] = storageName;
      }
      this.__el.save(this.__storeName);
    },


    clear : function() {
      // delete all entries from the storage
      for (var key in this.__reference) {
        this.__el.removeAttribute(this.__reference[key]);
      }
      this.__el.save(this.__storeName);
      // reset the internal maps
      this.__storage = {};
      this.__reference = {};
    },


    getKey : function(index) {
      return qx.Bootstrap.getKeys(this.__storage)[index];
    },


    iterate : function(callback, scope) {
      var length = this.getLength();
      for (var i = 0; i < length; i++) {
        var key = this.getKey(i);
        callback.call(scope, key, this.getItem(key));
      }
    }
  }
});