
const FRONTEND_URL = 'http://localhost:3000';
//Discord Authintification 

const getToken = async (code) => {
    //TODO: Replace with live URL
    const result = await fetch(FRONTEND_URL+'/getToken', {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  
    const resultJson = await result.json()
    return resultJson
  }

  const getMe = async () => {
    //TODO: Replace with live URL
    const result = await fetch(FRONTEND_URL+'/p/getMe');
    return result
  }

  const getProfile = async() =>{
    const result = await fetch(FRONTEND_URL+'/profile');

    const resultJson = await result.json();
    if(resultJson.error ==='No Token'){
        document.getElementById('login').style.display = `block`;
        return
    } else{
    const { avatar, banner, nick, roles, user, bio } = resultJson;
    const picture = `https://cdn.discordapp.com/avatars/${user.id}/${avatar}.png`;
    document.getElementById('guilds').innerText = roles;
    document.getElementById('avatar').src = picture;
    document.getElementById('avatar_small').src = picture;
    document.getElementById('info').innerText = `Logged in as: ${nick} (id: ${user.id})`;
    document.getElementById('logout').style.display = `block`;
    return resultJson
}
  };


// Import the leaflet package
var L = require('leaflet');
require('@geoman-io/leaflet-geoman-free');



/*Context Menu*/
L.Map.mergeOptions({
    contextmenuItems: []
});

L.Map.ContextMenu = L.Handler.extend({
    _touchstart: L.Browser.msPointer ? 'MSPointerDown' : L.Browser.pointer ? 'pointerdown' : 'touchstart',

    statics: {
        BASE_CLS: 'leaflet-contextmenu'
    },

    initialize: function (map) {
        L.Handler.prototype.initialize.call(this, map);

        this._items = [];
        this._visible = false;

        var container = this._container = L.DomUtil.create('div', L.Map.ContextMenu.BASE_CLS, map._container);
        container.style.zIndex = 10000;
        container.style.position = 'absolute';

        if (map.options.contextmenuWidth) {
            container.style.width = map.options.contextmenuWidth + 'px';
        }

        this._createItems();

        L.DomEvent
            .on(container, 'click', L.DomEvent.stop)
            .on(container, 'mousedown', L.DomEvent.stop)
            .on(container, 'dblclick', L.DomEvent.stop)
            .on(container, 'contextmenu', L.DomEvent.stop);
    },

    addHooks: function () {
        var container = this._map.getContainer();

        L.DomEvent
            .on(container, 'mouseleave', this._hide, this)
            .on(document, 'keydown', this._onKeyDown, this);

        if (L.Browser.touch) {
            L.DomEvent.on(document, this._touchstart, this._hide, this);
        }

        this._map.on({
            contextmenu: this._show,
            mousedown: this._hide,
            zoomstart: this._hide
        }, this);
    },

    removeHooks: function () {
        var container = this._map.getContainer();

        L.DomEvent
            .off(container, 'mouseleave', this._hide, this)
            .off(document, 'keydown', this._onKeyDown, this);

        if (L.Browser.touch) {
            L.DomEvent.off(document, this._touchstart, this._hide, this);
        }

        this._map.off({
            contextmenu: this._show,
            mousedown: this._hide,
            zoomstart: this._hide
        }, this);
    },

    showAt: function (point, data) {
        if (point instanceof L.LatLng) {
            point = this._map.latLngToContainerPoint(point);
        }
        this._showAtPoint(point, data);
    },

    hide: function () {
        this._hide();
    },

    addItem: function (options) {
        return this.insertItem(options);
    },

    insertItem: function (options, index) {
        index = index !== undefined ? index: this._items.length;

        var item = this._createItem(this._container, options, index);

        this._items.push(item);

        this._sizeChanged = true;

        this._map.fire('contextmenu.additem', {
            contextmenu: this,
            el: item.el,
            index: index
        });

        return item.el;
    },

    removeItem: function (item) {
        var container = this._container;

        if (!isNaN(item)) {
            item = container.children[item];
        }

        if (item) {
            this._removeItem(L.Util.stamp(item));

            this._sizeChanged = true;

            this._map.fire('contextmenu.removeitem', {
                contextmenu: this,
                el: item
            });

            return item;
        }

        return null;
    },

    removeAllItems: function () {
        var items = this._container.children,
            item;

        while (items.length) {
            item = items[0];
            this._removeItem(L.Util.stamp(item));
        }
        return items;
    },

    hideAllItems: function () {
        var item, i, l;

        for (i = 0, l = this._items.length; i < l; i++) {
            item = this._items[i];
            item.el.style.display = 'none';
        }
    },

    showAllItems: function () {
        var item, i, l;

        for (i = 0, l = this._items.length; i < l; i++) {
            item = this._items[i];
            item.el.style.display = '';
        }
    },

    setDisabled: function (item, disabled) {
        var container = this._container,
        itemCls = L.Map.ContextMenu.BASE_CLS + '-item';

        if (!isNaN(item)) {
            item = container.children[item];
        }

        if (item && L.DomUtil.hasClass(item, itemCls)) {
            if (disabled) {
                L.DomUtil.addClass(item, itemCls + '-disabled');
                this._map.fire('contextmenu.disableitem', {
                    contextmenu: this,
                    el: item
                });
            } else {
                L.DomUtil.removeClass(item, itemCls + '-disabled');
                this._map.fire('contextmenu.enableitem', {
                    contextmenu: this,
                    el: item
                });
            }
        }
    },

    isVisible: function () {
        return this._visible;
    },

    _createItems: function () {
        var itemOptions = this._map.options.contextmenuItems,
            item,
            i, l;

        for (i = 0, l = itemOptions.length; i < l; i++) {
            this._items.push(this._createItem(this._container, itemOptions[i]));
        }
    },

    _createItem: function (container, options, index) {
        if (options.separator || options === '-') {
            return this._createSeparator(container, index);
        }

        var itemCls = L.Map.ContextMenu.BASE_CLS + '-item',
            cls = options.disabled ? (itemCls + ' ' + itemCls + '-disabled') : itemCls,
            el = this._insertElementAt('a', cls, container, index),
            callback = this._createEventHandler(el, options.callback, options.context, options.hideOnSelect),
            icon = this._getIcon(options),
            iconCls = this._getIconCls(options),
            html = '';

        if (icon) {
            html = '<img class="' + L.Map.ContextMenu.BASE_CLS + '-icon" src="' + icon + '"/>';
        } else if (iconCls) {
            html = '<span class="' + L.Map.ContextMenu.BASE_CLS + '-icon ' + iconCls + '"></span>';
        }

        el.innerHTML = html + options.text;
        el.href = '#';

        L.DomEvent
            .on(el, 'mouseover', this._onItemMouseOver, this)
            .on(el, 'mouseout', this._onItemMouseOut, this)
            .on(el, 'mousedown', L.DomEvent.stopPropagation)
            .on(el, 'click', callback);

        if (L.Browser.touch) {
            L.DomEvent.on(el, this._touchstart, L.DomEvent.stopPropagation);
        }

        // Devices without a mouse fire "mouseover" on tap, but never “mouseout"
        if (!L.Browser.pointer) {
            L.DomEvent.on(el, 'click', this._onItemMouseOut, this);
        }

        return {
            id: L.Util.stamp(el),
            el: el,
            callback: callback
        };
    },

    _removeItem: function (id) {
        var item,
            el,
            i, l, callback;

        for (i = 0, l = this._items.length; i < l; i++) {
            item = this._items[i];

            if (item.id === id) {
                el = item.el;
                callback = item.callback;

                if (callback) {
                    L.DomEvent
                        .off(el, 'mouseover', this._onItemMouseOver, this)
                        .off(el, 'mouseover', this._onItemMouseOut, this)
                        .off(el, 'mousedown', L.DomEvent.stopPropagation)
                        .off(el, 'click', callback);

                    if (L.Browser.touch) {
                        L.DomEvent.off(el, this._touchstart, L.DomEvent.stopPropagation);
                    }

                    if (!L.Browser.pointer) {
                        L.DomEvent.on(el, 'click', this._onItemMouseOut, this);
                    }
                }

                this._container.removeChild(el);
                this._items.splice(i, 1);

                return item;
            }
        }
        return null;
    },

    _createSeparator: function (container, index) {
        var el = this._insertElementAt('div', L.Map.ContextMenu.BASE_CLS + '-separator', container, index);

        return {
            id: L.Util.stamp(el),
            el: el
        };
    },

    _createEventHandler: function (el, func, context, hideOnSelect) {
        var me = this,
            map = this._map,
            disabledCls = L.Map.ContextMenu.BASE_CLS + '-item-disabled',
            hideOnSelect = (hideOnSelect !== undefined) ? hideOnSelect : true;

        return function (e) {
            if (L.DomUtil.hasClass(el, disabledCls)) {
                return;
            }

            var map = me._map,
                containerPoint = me._showLocation.containerPoint,
                layerPoint = map.containerPointToLayerPoint(containerPoint),
                latlng = map.layerPointToLatLng(layerPoint),
                relatedTarget = me._showLocation.relatedTarget,
                data = {
                  containerPoint: containerPoint,
                  layerPoint: layerPoint,
                  latlng: latlng,
                  relatedTarget: relatedTarget
                };

            if (hideOnSelect) {
                me._hide();
            }

            if (func) {
                func.call(context || map, data);
            }

            me._map.fire('contextmenu.select', {
                contextmenu: me,
                el: el
            });
        };
    },

    _insertElementAt: function (tagName, className, container, index) {
        var refEl,
            el = document.createElement(tagName);

        el.className = className;

        if (index !== undefined) {
            refEl = container.children[index];
        }

        if (refEl) {
            container.insertBefore(el, refEl);
        } else {
            container.appendChild(el);
        }

        return el;
    },

    _show: function (e) {
        this._showAtPoint(e.containerPoint, e);
    },

    _showAtPoint: function (pt, data) {
        if (this._items.length) {
            var map = this._map,
            event = L.extend(data || {}, {contextmenu: this});

            this._showLocation = {
                containerPoint: pt
            };

            if (data && data.relatedTarget){
                this._showLocation.relatedTarget = data.relatedTarget;
            }

            this._setPosition(pt);

            if (!this._visible) {
                this._container.style.display = 'block';
                this._visible = true;
            }

            this._map.fire('contextmenu.show', event);
        }
    },

    _hide: function () {
        if (this._visible) {
            this._visible = false;
            this._container.style.display = 'none';
            this._map.fire('contextmenu.hide', {contextmenu: this});
        }
    },

    _getIcon: function (options) {
        return L.Browser.retina && options.retinaIcon || options.icon;
    },

    _getIconCls: function (options) {
        return L.Browser.retina && options.retinaIconCls || options.iconCls;
    },

    _setPosition: function (pt) {
        var mapSize = this._map.getSize(),
            container = this._container,
            containerSize = this._getElementSize(container),
            anchor;

        if (this._map.options.contextmenuAnchor) {
            anchor = L.point(this._map.options.contextmenuAnchor);
            pt = pt.add(anchor);
        }

        container._leaflet_pos = pt;

        if (pt.x + containerSize.x > mapSize.x) {
            container.style.left = 'auto';
            container.style.right = Math.min(Math.max(mapSize.x - pt.x, 0), mapSize.x - containerSize.x - 1) + 'px';
        } else {
            container.style.left = Math.max(pt.x, 0) + 'px';
            container.style.right = 'auto';
        }

        if (pt.y + containerSize.y > mapSize.y) {
            container.style.top = 'auto';
            container.style.bottom = Math.min(Math.max(mapSize.y - pt.y, 0), mapSize.y - containerSize.y - 1) + 'px';
        } else {
            container.style.top = Math.max(pt.y, 0) + 'px';
            container.style.bottom = 'auto';
        }
    },

    _getElementSize: function (el) {
        var size = this._size,
            initialDisplay = el.style.display;

        if (!size || this._sizeChanged) {
            size = {};

            el.style.left = '-999999px';
            el.style.right = 'auto';
            el.style.display = 'block';

            size.x = el.offsetWidth;
            size.y = el.offsetHeight;

            el.style.left = 'auto';
            el.style.display = initialDisplay;

            this._sizeChanged = false;
        }

        return size;
    },

    _onKeyDown: function (e) {
        var key = e.keyCode;

        // If ESC pressed and context menu is visible hide it
        if (key === 27) {
            this._hide();
        }
    },

    _onItemMouseOver: function (e) {
        L.DomUtil.addClass(e.target || e.srcElement, 'over');
    },

    _onItemMouseOut: function (e) {
        L.DomUtil.removeClass(e.target || e.srcElement, 'over');
    }
});

L.Map.addInitHook('addHandler', 'contextmenu', L.Map.ContextMenu);

/* global L */

/**
 * @name Sidebar
 * @class L.Control.Sidebar
 * @extends L.Control
 * @param {string} id - The id of the sidebar element (without the # character)
 * @param {Object} [options] - Optional options object
 * @param {string} [options.position=left] - Position of the sidebar: 'left' or 'right'
 * @see L.control.sidebar
 */
L.Control.Sidebar = L.Control.extend(/** @lends L.Control.Sidebar.prototype */ {
    includes: (L.Evented.prototype || L.Mixin.Events),

    options: {
        position: 'left'
    },

    initialize: function (id, options) {
        var i, child;

        L.setOptions(this, options);

        // Find sidebar HTMLElement
        this._sidebar = L.DomUtil.get(id);

        // Attach .sidebar-left/right class
        L.DomUtil.addClass(this._sidebar, 'sidebar-' + this.options.position);

        // Attach touch styling if necessary
        if (L.Browser.touch)
            L.DomUtil.addClass(this._sidebar, 'leaflet-touch');

        // Find sidebar > div.sidebar-content
        for (i = this._sidebar.children.length - 1; i >= 0; i--) {
            child = this._sidebar.children[i];
            if (child.tagName == 'DIV' &&
                    L.DomUtil.hasClass(child, 'sidebar-content'))
                this._container = child;
        }

        // Find sidebar ul.sidebar-tabs > li, sidebar .sidebar-tabs > ul > li
        this._tabitems = this._sidebar.querySelectorAll('ul.sidebar-tabs > li, .sidebar-tabs > ul > li');
        for (i = this._tabitems.length - 1; i >= 0; i--) {
            this._tabitems[i]._sidebar = this;
        }

        // Find sidebar > div.sidebar-content > div.sidebar-pane
        this._panes = [];
        this._closeButtons = [];
        for (i = this._container.children.length - 1; i >= 0; i--) {
            child = this._container.children[i];
            if (child.tagName == 'DIV' &&
                L.DomUtil.hasClass(child, 'sidebar-pane')) {
                this._panes.push(child);

                var closeButtons = child.querySelectorAll('.sidebar-close');
                for (var j = 0, len = closeButtons.length; j < len; j++)
                    this._closeButtons.push(closeButtons[j]);
            }
        }
    },

    /**
     * Add this sidebar to the specified map.
     *
     * @param {L.Map} map
     * @returns {Sidebar}
     */
    addTo: function (map) {
        var i, child;

        this._map = map;

        for (i = this._tabitems.length - 1; i >= 0; i--) {
            child = this._tabitems[i];
            var sub = child.querySelector('a');
            if (sub.hasAttribute('href') && sub.getAttribute('href').slice(0,1) == '#') {
                L.DomEvent
                    .on(sub, 'click', L.DomEvent.preventDefault )
                    .on(sub, 'click', this._onClick, child);
            }
        }

        for (i = this._closeButtons.length - 1; i >= 0; i--) {
            child = this._closeButtons[i];
            L.DomEvent.on(child, 'click', this._onCloseClick, this);
        }

        return this;
    },

    /**
     * @deprecated - Please use remove() instead of removeFrom(), as of Leaflet 0.8-dev, the removeFrom() has been replaced with remove()
     * Removes this sidebar from the map.
     * @param {L.Map} map
     * @returns {Sidebar}
     */
     removeFrom: function(map) {
         console.log('removeFrom() has been deprecated, please use remove() instead as support for this function will be ending soon.');
         this.remove(map);
     },

    /**
     * Remove this sidebar from the map.
     *
     * @param {L.Map} map
     * @returns {Sidebar}
     */
    remove: function (map) {
        var i, child;

        this._map = null;

        for (i = this._tabitems.length - 1; i >= 0; i--) {
            child = this._tabitems[i];
            L.DomEvent.off(child.querySelector('a'), 'click', this._onClick);
        }

        for (i = this._closeButtons.length - 1; i >= 0; i--) {
            child = this._closeButtons[i];
            L.DomEvent.off(child, 'click', this._onCloseClick, this);
        }

        return this;
    },

    /**
     * Open sidebar (if necessary) and show the specified tab.
     *
     * @param {string} id - The id of the tab to show (without the # character)
     */
    open: function(id) {
        var i, child;

        // hide old active contents and show new content
        for (i = this._panes.length - 1; i >= 0; i--) {
            child = this._panes[i];
            if (child.id == id)
                L.DomUtil.addClass(child, 'active');
            else if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }

        // remove old active highlights and set new highlight
        for (i = this._tabitems.length - 1; i >= 0; i--) {
            child = this._tabitems[i];
            if (child.querySelector('a').hash == '#' + id)
                L.DomUtil.addClass(child, 'active');
            else if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }

        this.fire('content', { id: id });

        // open sidebar (if necessary)
        if (L.DomUtil.hasClass(this._sidebar, 'collapsed')) {
            this.fire('opening');
            L.DomUtil.removeClass(this._sidebar, 'collapsed');
        }

        return this;
    },

    /**
     * Close the sidebar (if necessary).
     */
    close: function() {
        // remove old active highlights
        for (var i = this._tabitems.length - 1; i >= 0; i--) {
            var child = this._tabitems[i];
            if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }

        // close sidebar
        if (!L.DomUtil.hasClass(this._sidebar, 'collapsed')) {
            this.fire('closing');
            L.DomUtil.addClass(this._sidebar, 'collapsed');
        }

        return this;
    },

    /**
     * @private
     */
    _onClick: function() {
        if (L.DomUtil.hasClass(this, 'active'))
            this._sidebar.close();
        else if (!L.DomUtil.hasClass(this, 'disabled'))
            this._sidebar.open(this.querySelector('a').hash.slice(1));
    },

    /**
     * @private
     */
    _onCloseClick: function () {
        this.close();
    }
});

/**
 * Creates a new sidebar.
 *
 * @example
 * var sidebar = L.control.sidebar('sidebar').addTo(map);
 *
 * @param {string} id - The id of the sidebar element (without the # character)
 * @param {Object} [options] - Optional options object
 * @param {string} [options.position=left] - Position of the sidebar: 'left' or 'right'
 * @returns {Sidebar} A new sidebar instance
 */
L.control.sidebar = function (id, options) {
    return new L.Control.Sidebar(id, options);
};
/*
 * L.Control.Coordinates is used for displaying current mouse coordinates on the map.
 */
L.NumberFormatter = {
	round: function(num, dec, sep) {
		var res = L.Util.formatNum(num, dec) + "",
			numbers = res.split(".");
		if (numbers[1]) {
			var d = dec - numbers[1].length;
			for (; d > 0; d--) {
				numbers[1] += "0";
			}
			res = numbers.join(sep || ".");
		}
		return res;
	},

	toDMS: function(deg) {
		var d = Math.floor(Math.abs(deg));
		var minfloat = (Math.abs(deg) - d) * 60;
		var m = Math.floor(minfloat);
		var secfloat = (minfloat - m) * 60;
		var s = Math.round(secfloat);
		if (s == 60) {
			m++;
			s = "00";
		}
		if (m == 60) {
			d++;
			m = "00";
		}
		if (s < 10) {
			s = "0" + s;
		}
		if (m < 10) {
			m = "0" + m;
		}
		var dir = "";
		if (deg < 0) {
			dir = "-";
		}
		return ("" + dir + d + "&deg; " + m + "' " + s + "''");
	},

	createValidNumber: function(num, sep) {
		if (num && num.length > 0) {
			var numbers = num.split(sep || ".");
			try {
				var numRes = Number(numbers.join("."));
				if (isNaN(numRes)) {
					return undefined;
				}
				return numRes;
			} catch (e) {
				return undefined;
			}
		}
		return undefined;
	}
};
L.Control.Coordinates = L.Control.extend({
	options: {
		position: 'bottomright',
		//decimals used if not using DMS or labelFormatter functions
		decimals: 4,
		//decimalseperator used if not using DMS or labelFormatter functions
		decimalSeperator: ".",
		//label templates for usage if no labelFormatter function is defined
		labelTemplateLat: "Lat: {y}",
		labelTemplateLng: "Lng: {x}",
		//label formatter functions
		labelFormatterLat: undefined,
		labelFormatterLng: undefined,
		//switch on/off input fields on click
		enableUserInput: true,
		//use Degree-Minute-Second
		useDMS: false,
		//if true lat-lng instead of lng-lat label ordering is used
		useLatLngOrder: false,
		//if true user given coordinates are centered directly
		centerUserCoordinates: false,
		//leaflet marker type
		markerType: L.marker,
		//leaflet marker properties
		markerProps: {}
	},

	onAdd: function(map) {
		this._map = map;

		var className = 'leaflet-control-coordinates',
			container = this._container = L.DomUtil.create('div', className),
			options = this.options;

		//label containers
		this._labelcontainer = L.DomUtil.create("div", "uiElement label", container);
		this._label = L.DomUtil.create("span", "labelFirst", this._labelcontainer);


		//input containers
		this._inputcontainer = L.DomUtil.create("div", "uiElement input uiHidden", container);
		var xSpan, ySpan;
		if (options.useLatLngOrder) {
			ySpan = L.DomUtil.create("span", "", this._inputcontainer);
			this._inputY = this._createInput("inputY", this._inputcontainer);
			xSpan = L.DomUtil.create("span", "", this._inputcontainer);
			this._inputX = this._createInput("inputX", this._inputcontainer);
		} else {
			xSpan = L.DomUtil.create("span", "", this._inputcontainer);
			this._inputX = this._createInput("inputX", this._inputcontainer);
			ySpan = L.DomUtil.create("span", "", this._inputcontainer);
			this._inputY = this._createInput("inputY", this._inputcontainer);
		}
		xSpan.innerHTML = options.labelTemplateLng.replace("{x}", "");
		ySpan.innerHTML = options.labelTemplateLat.replace("{y}", "");

		L.DomEvent.on(this._inputX, 'keyup', this._handleKeypress, this);
		L.DomEvent.on(this._inputY, 'keyup', this._handleKeypress, this);

		//connect to mouseevents
		map.on("mousemove", this._update, this);
		map.on('dragstart', this.collapse, this);

		map.whenReady(this._update, this);

		this._showsCoordinates = true;
		//wether or not to show inputs on click
		if (options.enableUserInput) {
			L.DomEvent.addListener(this._container, "click", this._switchUI, this);
		}

		return container;
	},

	/**
	 *	Creates an input HTML element in given container with given classname
	 */
	_createInput: function(classname, container) {
		var input = L.DomUtil.create("input", classname, container);
		input.type = "text";
		L.DomEvent.disableClickPropagation(input);
		return input;
	},

	_clearMarker: function() {
		this._map.removeLayer(this._marker);
	},

	/**
	 *	Called onkeyup of input fields
	 */
	_handleKeypress: function(e) {
		switch (e.keyCode) {
			case 27: //Esc
				this.collapse();
				break;
			case 13: //Enter
				this._handleSubmit();
				this.collapse();
				break;
			default: //All keys
				this._handleSubmit();
				break;
		}
	},

	/**
	 *	Called on each keyup except ESC
	 */
	_handleSubmit: function() {
		var x = L.NumberFormatter.createValidNumber(this._inputX.value, this.options.decimalSeperator);
		var y = L.NumberFormatter.createValidNumber(this._inputY.value, this.options.decimalSeperator);
		if (x !== undefined && y !== undefined) {
			var marker = this._marker;
			if (!marker) {
				marker = this._marker = this._createNewMarker();
				marker.on("click", this._clearMarker, this);
			}
			var ll = new L.LatLng(y, x);
			marker.setLatLng(ll);
			marker.addTo(this._map);
			if (this.options.centerUserCoordinates) {
				this._map.setView(ll, this._map.getZoom());
			}
		}
	},

	/**
	 *	Shows inputs fields
	 */
	expand: function() {
		this._showsCoordinates = false;

		this._map.off("mousemove", this._update, this);

		L.DomEvent.addListener(this._container, "mousemove", L.DomEvent.stop);
		L.DomEvent.removeListener(this._container, "click", this._switchUI, this);

		L.DomUtil.addClass(this._labelcontainer, "uiHidden");
		L.DomUtil.removeClass(this._inputcontainer, "uiHidden");
	},

	/**
	 *	Creates the label according to given options and formatters
	 */
	_createCoordinateLabel: function(ll) {
		var opts = this.options,
			x, y;
		if (opts.customLabelFcn) {
			return opts.customLabelFcn(ll, opts);
		}
		if (opts.labelFormatterLng) {
			x = opts.labelFormatterLng(ll.lng);
		} else {
			x = L.Util.template(opts.labelTemplateLng, {
				x: this._getNumber(ll.lng, opts)
			});
		}
		if (opts.labelFormatterLat) {
			y = opts.labelFormatterLat(ll.lat);
		} else {
			y = L.Util.template(opts.labelTemplateLat, {
				y: this._getNumber(ll.lat, opts)
			});
		}
		if (opts.useLatLngOrder) {
			return y + " " + x;
		}
		return x + " " + y;
	},

	/**
	 *	Returns a Number according to options (DMS or decimal)
	 */
	_getNumber: function(n, opts) {
		var res;
		if (opts.useDMS) {
			res = L.NumberFormatter.toDMS(n);
		} else {
			res = L.NumberFormatter.round(n, opts.decimals, opts.decimalSeperator);
		}
		return res;
	},

	/**
	 *	Shows coordinate labels after user input has ended. Also
	 *	displays a marker with popup at the last input position.
	 */
	collapse: function() {
		if (!this._showsCoordinates) {
			this._map.on("mousemove", this._update, this);
			this._showsCoordinates = true;
			var opts = this.options;
			L.DomEvent.addListener(this._container, "click", this._switchUI, this);
			L.DomEvent.removeListener(this._container, "mousemove", L.DomEvent.stop);

			L.DomUtil.addClass(this._inputcontainer, "uiHidden");
			L.DomUtil.removeClass(this._labelcontainer, "uiHidden");

			if (this._marker) {
				var m = this._createNewMarker(),
					ll = this._marker.getLatLng();
				m.setLatLng(ll);

				var container = L.DomUtil.create("div", "");
				var label = L.DomUtil.create("div", "", container);
				label.innerHTML = this._ordinateLabel(ll);

				var close = L.DomUtil.create("a", "", container);
				close.innerHTML = "Remove";
				close.href = "#";
				var stop = L.DomEvent.stopPropagation;

				L.DomEvent
					.on(close, 'click', stop)
					.on(close, 'mousedown', stop)
					.on(close, 'dblclick', stop)
					.on(close, 'click', L.DomEvent.preventDefault)
					.on(close, 'click', function() {
						this._map.removeLayer(m);
					}, this);

				m.bindPopup(container);
				m.addTo(this._map);
				this._map.removeLayer(this._marker);
				this._marker = null;
			}
		}
	},

	/**
	 *	Click callback for UI
	 */
	_switchUI: function(evt) {
		L.DomEvent.stop(evt);
		L.DomEvent.stopPropagation(evt);
		L.DomEvent.preventDefault(evt);
		if (this._showsCoordinates) {
			//show textfields
			this.expand();
		} else {
			//show coordinates
			this.collapse();
		}
	},

	onRemove: function(map) {
		map.off("mousemove", this._update, this);
	},

	/**
	 *	Mousemove callback function updating labels and input elements
	 */
	_update: function(evt) {
		var pos = evt.latlng,
			opts = this.options;
		if (pos) {
			pos = pos.wrap();
			this._currentPos = pos;
			this._inputY.value = L.NumberFormatter.round(pos.lat, opts.decimals, opts.decimalSeperator);
			this._inputX.value = L.NumberFormatter.round(pos.lng, opts.decimals, opts.decimalSeperator);
			this._label.innerHTML = this._createCoordinateLabel(pos);
		}
	},

	_createNewMarker: function() {
		return this.options.markerType(null, this.options.markerProps);
	}

});

//constructor registration
L.control.coordinates = function(options) {
	return new L.Control.Coordinates(options);
};

//map init hook
L.Map.mergeOptions({
	coordinateControl: false
});

L.Map.addInitHook(function() {
	if (this.options.coordinateControl) {
		this.coordinateControl = new L.Control.Coordinates();
		this.addControl(this.coordinateControl);
	}
});

var scaleX = -128/1550000; 
var scaleY = -128/1550000;
var offsetX = 130.05; 
var offsetY = 2.05;

var yx = L.latLng;

var xy = function(x, y) {
    if (Array.isArray(x)) {    // When doing xy([x, y]);
        return yx(offsetX-x[1]*scaleX, x[0]*scaleY-offsetY);
    }
    return yx(y*scaleY-offsetY, offsetX-x*scaleX);  // When doing xy(x, y);
};

// Creates a leaflet map binded to an html <div> with id "map"
// setView will set the initial map view to the location at coordinates
// 13 represents the initial zoom level with higher values being more zoomed in
    // Calculated scaling factors and offsets
//TODO: MAP Marker
var map = L.map('map',{    
    crs: L.CRS.Simple,
	contextmenu: false,
}).setView(xy(
    -778262.810982477,
    664265.9492284984), 6);

// Adds the basemap tiles to your web map
// Additional providers are available at: https://leaflet-extras.github.io/leaflet-providers/preview/
L.tileLayer('images/tiles/{z}/{x}/{y}.png', {
    continuousWorld: false,
    noWrap: true,  
	attribution: '&copy;',
    minZoom: 3,
	maxZoom: 9,
    errorTileUrl: 'images/tiles/9/0/98.png',
}).addTo(map);

  //Boundaries Variables
 var mapSW = [-128,0], mapNE = [0,128];
 map.setMaxBounds(new L.LatLngBounds(mapSW, mapNE));
 //Icons
 var microPOI = L.icon({
	iconUrl: 'images/icons/TUI_Icon_Map_MicroPOI.png',
	iconRetinaUrl: 'images/icons/TUI_Icon_Map_MicroPOI.png',
	iconSize:    [25, 25],
 });
 var minorPOI = L.icon({
	iconUrl: 'images/icons/TUI_Icon_Map_MinorPOI.png',
	iconRetinaUrl: 'images/icons/TUI_Icon_Map_MinorPOI.png',
	iconSize:    [25, 25],
 });
 var treePOI = L.icon({
	iconUrl: 'images/icons/TUI_Icon_Node_LVL0.png',
	iconRetinaUrl: 'images/icons/TUI_Icon_Node_LVL0.png',
	iconSize:    [15, 15],
 });
 var nodeCapital = L.icon({
	iconUrl: 'images/icons/TUI_Icon_Node_LVL3.png',
	iconRetinaUrl: 'images/icons/TUI_Icon_Node_LVL3.png',
	iconSize:    [25, 25],
	shadowUrl:'images/icons/TUI_Icon_Map_Banner_01.png',
	shadowRetinaUrl:'images/icons/TUI_Icon_Map_Banner_01.png',
	shadowSize: [40,55],
	shadowAnchor: [20,25]
 });
 var npcTown = L.icon({
	iconUrl: 'images/icons/TUI_Icon_Node_LVL0.png',
	iconRetinaUrl: 'images/icons/TUI_Icon_Node_LVL0.png',
	iconSize:    [25, 25],
	shadowUrl:'images/icons/TUI_Icon_Map_Banner_02.png',
	shadowRetinaUrl:'images/icons/TUI_Icon_Map_Banner_01.png',
	shadowSize: [40,55],
	shadowAnchor: [20,25]
 });
 var reviveShrine = L.icon({
	iconUrl: 'images/icons/TUI_Icon_Map_ReviveShrine_Active.png',
	iconRetinaUrl: 'images/icons/TUI_Icon_Map_ReviveShrine_Active.png',
	iconSize:    [20, 20],
 });
 var woodshopIcon = L.icon({
	iconUrl: 'images/icons/TUI_Icon_Map_Carpentry.png',
	iconRetinaUrl: 'images/icons/TUI_Icon_Map_Carpentry.png',
	iconSize:    [30, 30],
 });
 var laboratoryIcon = L.icon({
	iconUrl: 'images/icons/TUI_Icon_Map_Node_Laboratory.png',
	iconRetinaUrl: 'images/icons/TUI_Icon_Map_Node_Laboratory.png',
	iconSize:    [30, 30],
 });
 var cookhouseIcon = L.icon({
	iconUrl: 'images/icons/TUI_Icon_Map_Cooking.png',
	iconRetinaUrl: 'images/icons/TUI_Icon_Map_Cooking.png',
	iconSize:    [30, 30],
 });
 var smithyIcon = L.icon({
	iconUrl: 'images/icons/TUI_Icon_Map_Node_Smithy.png',
	iconRetinaUrl: 'images/icons/TUI_Icon_Map_Node_Smithy.png',
	iconSize:    [30, 30],
 });
 var agriculturalSuppliesIcon = L.icon({
	iconUrl: 'images/icons/TUI_Icon_Map_Node_AgriculturalSupplies.png',
	iconRetinaUrl: 'images/icons/TUI_Icon_Map_Node_AgriculturalSupplies.png',
	iconSize:    [30, 30],
 });
 var textureMillIcon = L.icon({
	iconUrl: 'images/icons/TUI_Icon_Map_Node_TextureMill.png',
	iconRetinaUrl: 'images/icons/TUI_Icon_Map_Node_TextureMill.png',
	iconSize:    [30, 30],
 });
 var hideworksIcon = L.icon({
	iconUrl: 'images/icons/TUI_Icon_Map_Leatherworking.png',
	iconRetinaUrl: 'images/icons/TUI_Icon_Map_Leatherworking.png',
	iconSize:    [30, 30],
 });
 var stoneworksIcon = L.icon({
	iconUrl: 'images/icons/TUI_Icon_Map_Stonemasonry.png',
	iconRetinaUrl: 'images/icons/TUI_Icon_Map_Stonemasonry.png',
	iconSize:    [30, 30],
 });

//TODO:POIs ******************************************************************************************
var highwaymenHills = L.marker(xy(
    -629043.941659,
    482068.428075
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Highwaymen Hills'
);
var highwaymenHillsTooltip= L.tooltip(
    {
        className:'poi-tooltip',
        permanent: true,
        content: 'Highwaymen Hills'
        
    })
    .setLatLng(xy(
        -629043.941659,
        482068.428075
    ))
    .addTo(map);

var oakenbaneKeep = L.marker(xy(
    -549151.32979300001,
    643083.69519400003
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Oakenbane Keep'
);
var oakenbaneKeepTooltip= L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -549151.32979300001,
        643083.69519400003
    ))
    .setContent(
        'Oakenbane Keep'
    )
    .addTo(map);

var wreckageOfCarphin = L.marker(xy(
    -483884.13053600001,
    450651.24467799999
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Wreckage of Carphin'
);
var wreckageOfCarphinTooltip= L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -483884.13053600001,
        450651.24467799999
    ))
    .setContent(
        'Wreckage of Carphin'
    )
    .addTo(map);

var towerOfCarphin = L.marker(xy(
    -516135.42876099999,
    448537.29489399999
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Tower of Carphin'
);
var towerOfCarphinTooltip= L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -516135.42876099999,
        448537.29489399999
    ))
    .setContent(
        'Colossus Crater'
    )
    .addTo(map);

var colossusCrater = L.marker(xy(
    -507233.42393599998,
    541831.95291200001
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Colossus Crater'
);
var colossusCraterTooltip= L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -507233.42393599998,
        541831.95291200001
    ))
    .setContent(
        'Colossus Crater'
    )
    .addTo(map);


var titansRing = L.marker(xy(
    -554065.61824400001,
    571503.75177199999
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Titan\'s Ring'
);
var titansRingTooltip= L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -554065.61824400001,
        571503.75177199999
    ))
    .setContent(
        'Titan\'s Ring'
    )
    .addTo(map);


var gemspring = L.marker(
    xy(
        -625691.41067799996,
        562983.97366999998
    ), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Gemspring'
);
var gemspringTooltip = L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -625691.41067799996,
        562983.97366999998
    ))
    .setContent(
        'Gemspring'
    )
    .addTo(map);

var briarmoorFarms = L.marker(xy(
    -715850,
    567522
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Briarmoor Farms'
);
var briarmoorFarmsTooltip = L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -715850,
        567522
    ))
    .setContent('Briarmoor Farms')
    .addTo(map);

var korraLoch = L.marker(xy(
    -711119.48747099994,
    521054.43796700001
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Korra\'Loch'
);
var korraLochTooltip = L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -711119.48747099994,
        521054.43796700001
    ))
    .setContent('Korra\'Loch')
    .addTo(map);

var nikaBraeRuins = L.marker(xy(
    -676434.87055300002,
    526747.25205699995
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Nika\'Brae Ruins'
);
var nikaBraeRuinsTooltip = L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -676434.87055300002,
        526747.25205699995
    ))
    .setContent('Nika\'Brae Ruins')
    .addTo(map);

var citadelOftheSteelBloom = L.marker(xy(
    -781401.28867599997,
    452480.98183200002
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Citadel of the Steel Bloom'
);
var citadelOftheSteelBloomTooltip = L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -781401.28867599997,
        452480.98183200002
    ))
    .setContent('Citadel of the Steel Bloom')
    .addTo(map);

var gravepeak = L.marker(xy(
    -826774.31349199999,
    227203.30506799999
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Gravepeak'
);
var gravepeakTooltip = L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -826774.31349199999,
        227203.30506799999
    ))
    .setContent('Gravepeak')
    .addTo(map);

var ursineCaves = L.marker(xy(
    -942360.85678999999,
    421295.29098400002
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Ursine Caves'
);
var ursineCavesTooltip = L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -942360.85678999999,
        421295.29098400002
    ))
    .setContent('Ursine Caves')
    .addTo(map);

var remnantsOfSephillion = L.marker(xy(
    -952248.006742,
    757437.16674899997
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Remnants of Sephillion'
);
var remnantsOfSephillionTooltip = L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -952248.006742,
        757437.16674899997
    ))
    .setContent( 
        'Remnants of Sephillion'
    )
    .addTo(map);


var daragalEstates = L.marker(xy(
    -1068117.7261000001,
    656829.44643899996
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Daragal Estates'
);
var daragalEstatesTooltip = L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -1068117.7261000001,
        656829.44643899996
    ))
    .setContent( 
       'Daragal Estates'
    )
    .addTo(map);

var theHallofJudication = L.marker(xy(
    -968874.48929099995,
    533924.56122599996
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'The Hall of Judication'
);
var theHallofJudicationTooltip = L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -968874.48929099995,
        533924.56122599996
    ))
    .setContent( 
       'The Hall of Judication'
    )
    .addTo(map);

var baneswoodCemetery = L.marker(xy(
    -642131.95504999999,
    633437.68978500005
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Baneswood Cemetery'
);
var baneswoodCemeteryTooltip = L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -642131.95504999999,
        633437.68978500005
    ))
    .setContent( 
      'Baneswood Cemetery'
    )
    .addTo(map);

var fieldOfStackedStones = L.marker(xy(
    -1143543.8585729999,
    574986.473994
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Field of Stacked Stones'
);
var fieldOfStackedStonesTooltip = L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -1143543.8585729999,
        574986.473994
    ))
    .setContent( 
     'Field of Stacked Stones'
    )
    .addTo(map);

var church_of_the_Seven_Stars = L.marker(xy(
    -914918.60975399998,
    647237.27745299996
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Church of the Seven Stars'
);
var church_of_the_Seven_StarsTooltip = L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -914918.60975399998,
        647237.27745299996
    ))
    .setContent( 
    'Church of the Seven Stars'
    )
    .addTo(map);

var ndSwordOutpost = L.marker(xy(
    -950349.43609800003,
    610261.21566099999
), {icon: minorPOI}).addTo(map)
.bindPopup(
    '2nd Sword Outpost'
);
var ndSwordOutpostTooltip = L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -950349.43609800003,
        610261.21566099999
    ))
    .setContent( 
    '2nd Sword Outpost'
    )
    .addTo(map);


var befallenForge = L.marker(xy(
    -1252108.998413,
    580877.44792199996
), {icon: minorPOI}).addTo(map)
.bindPopup(
    'Befallen Forge'
);
var befallenForgeTooltip = L.tooltip({
    className:'poi-tooltip',
    permanent: true,
})
    .setLatLng(xy(
        -1252108.998413,
        580877.44792199996
    ))
    .setContent( 
      'Befallen Forge'
    )
    .addTo(map);



var groupPOI = L.layerGroup([
    highwaymenHillsTooltip,
    oakenbaneKeepTooltip,
    wreckageOfCarphinTooltip,
    towerOfCarphinTooltip,
    colossusCraterTooltip,
    titansRingTooltip,
    gemspringTooltip,
    briarmoorFarmsTooltip,
    korraLochTooltip,
    nikaBraeRuinsTooltip,
    citadelOftheSteelBloomTooltip,
    gravepeakTooltip,
    ursineCavesTooltip,
    remnantsOfSephillionTooltip,
    daragalEstatesTooltip,
    theHallofJudicationTooltip,
    baneswoodCemeteryTooltip,
    fieldOfStackedStonesTooltip,
    church_of_the_Seven_StarsTooltip,
    ndSwordOutpostTooltip,
    befallenForgeTooltip
]);
//Starter Locations
var woodshop = L.marker(xy(
    -682735,
    566392
), {icon: woodshopIcon}).addTo(map)
.bindPopup(
    'Woodshop'
);
var laboratory = L.marker(xy(
    -686961,
    578887
), {icon: laboratoryIcon}).addTo(map)
.bindPopup(
    'Laboratory'
);
var cookhouse = L.marker(xy(
    -663531,
    560028
), {icon: cookhouseIcon}).addTo(map)
.bindPopup(
    'Cookhouse'
);
var smithy = L.marker(xy(
    -864155,
    602808
), {icon: smithyIcon}).addTo(map)
.bindPopup(
    'Smithy'
);
var hideworks = L.marker(xy(
    -866549,
    613887
), {icon: hideworksIcon}).addTo(map)
.bindPopup(
    'Hideworks'
);
var stoneworks = L.marker(xy(
    -702219,
    544522
), {icon: stoneworksIcon}).addTo(map)
.bindPopup(
    'Stoneworks'
);
var textileMill = L.marker(xy(
    -873448,
    606003
), {icon: textureMillIcon}).addTo(map)
.bindPopup(
    'Textile Mill'
);
var agriculturalSupply = L.marker(xy(
    -903527,
    601331
), {icon: agriculturalSuppliesIcon}).addTo(map)
.bindPopup(
    'Agricultural Supplies'
);

var starterPOI = L.layerGroup([
    laboratory,
    woodshop,
    cookhouse,
    smithy,
    hideworks,
    stoneworks,
    textileMill,
    agriculturalSupply
]);

//WILLOW TREES **********************************************************************************
var willow2 = L.marker(xy(-923754.536113,480510.828354), {icon: treePOI}).addTo(map)
	.bindPopup(
		'Willow'
	)
var willow1 = L.marker(xy(-1079824.093681,588150.267604), {icon: treePOI}).addTo(map)
.bindPopup(
	'Willow'
)
var willow3 =L.marker(xy(-496951.252121,674277.562915), {icon: treePOI}).addTo(map)
.bindPopup(
	'Willow'
)
var willow4 = L.marker(xy(-1079328.053174,524960.628154), {icon: treePOI}).addTo(map)
.bindPopup(
	'Willow'
)
var willow5 = L.marker(xy(-1018387.177767,374081.988515), {icon: treePOI}).addTo(map)
.bindPopup(
	'Willow'
)
var willow6 =L.marker(xy(-1041901.286697,665105.470737), {icon: treePOI}).addTo(map)
.bindPopup(
	'Willow'
)
var willow7 = L.marker(xy(-539057.698698,526158.357873), {icon: treePOI}).addTo(map)
.bindPopup(
	'Willow'
)
var willow8 = L.marker(xy(-1025356.820736,349732.920564), {icon: treePOI}).addTo(map)
.bindPopup(
	'Willow'
)
var willow9 =L.marker(xy(-896242.490566,443929.074017), {icon: treePOI}).addTo(map)
.bindPopup(
	'Willow'
)

var groupWillows = L.layerGroup([willow1,willow2,willow3,willow4,willow5,willow6,willow7,willow8,willow9]);

// CITIES ****************************************************************************************************
var winstead =L.marker(xy(-650664.6618544741, 375092.8714282753), {
	icon: nodeCapital,
	title:'Winstead',
	alt: 'Winstead'
}).addTo(map)
.bindPopup(
	'<h3>Winstead</h3>'+
	'<dl>'+
	'<dt>Stoneworks</dt>'+
        '<dd> - Journeyman Mining</dd>'+
        '<dd> - Apprentice Stoneworking</dd>'+
        '<dd> - Apprentice Jewlcrafting</dd>'+
	'<dt>Woodshop</dt>'+
        '<dd> - Journeyman Lumbermilling</dd>'+
        '<dd> - Apprentice Carpentry</dd>'+
        '<dd> - Apprentice Lumberjacking</dd>'+
	'<dt>Farm</dt>'+
	'<dt>Factory</dt>'+
	'</dl>'
)

var halcyon = L.marker(xy(-893144.5990908266, 314176.277008693), {
	icon: nodeCapital,
	title:'Halcyon',
	alt: 'Halcyon'
}).addTo(map)
.bindPopup(
	'<h3>Halcyon</h3>'+
	'<dl>'+
	'<dt>Labratory</dt>'+
        '<dd> - Journeyman Scribing</dd>'+
        '<dd> - Apprentice Alchemy</dd>'+
        '<dd> - Apprentice Arcane Engeniering</dd>'+
	'<dt>Hideworks</dt>'+
        '<dd> - Journeyman Tanning</dd>'+
        '<dd> - Apprentice Letherworking</dd>'+
	'<dt>School of Construction</dt>'+
	'</dl>'
)
var joeva = L.marker(xy(-1095725.4246442425, 522113.5947613014), {
	icon: nodeCapital,
	title:'Joeva',
	alt: 'Joeva'
}).addTo(map)
.bindPopup(
	'<h3>Joeva</h3>'+
	'<dl>'+
	'<dt>Cookhouse</dt>'+
        '<dd> - Journeyman Hunting</dd>'+
        '<dd> - Apprentice Fishing</dd>'+
        '<dd> - Apprentice Cooking</dd>'+
	'<dt>Stoneworks</dt>'+
	'<dt>Smithy</dt>'+
        '<dd> - Journeyman Armorsmithing</dd>'+
        '<dd> - Apprentice Metalworking</dd>'+
        '<dd> - Apprentice Weaponsmithing</dd>'+
	'</dl>'
)
var newAela =L.marker( xy(-1133445.8278337393, 854920.0843213046), {
	icon: nodeCapital,
	title:'New Aela',
	alt: 'New Aela'
}).addTo(map)
.bindPopup(
	'<h3>New Aela</h3>'+
	'<dl>'+
	'<dt>Trade Bureau</dt>'+
	'<dt>Woodshop</dt>'+
        '<dd> - Journeyman Carpentry</dd>'+
        '<dd> - Apprentice Lumberjacking</dd>'+
        '<dd> - Apprentice Lumbermilling</dd>'+
	'<dt>Agricultural Supplies</dt>'+
        '<dd> - Journeyman Herbalism</dd>'+
        '<dd> - Apprentice Farming</dd>'+
        '<dd> - Apprentice Animal Husbandry</dd>'+
	'</dl>'
)
var miraleth = L.marker( xy(-465960.7421875001, 588079.2968750002), {
	icon: nodeCapital,
	title:'Miraleth',
	alt: 'Miraleth'
}).addTo(map)
.bindPopup(
	'<h3>Miraleth</h3>'+
	'<dl>'+
	'<dt>Factory</dt>'+
	'<dt>Factory (2nd)</dt>'+
	'<dt>Smithy-Jorneyman</dt>'+
        '<dd> - Journeyman Metalworking</dd>'+
        '<dd> - Apprentice Armorsmithing</dd>'+
        '<dd> - Apprentice Weponsmithing</dd>'+
	'<dt>Textile Mill</dt>'+
        '<dd> - Journeyman Weaving</dd>'+
        '<dd> - Apprentice Tailoring</dd>'+
	'</dl>'
)
var sunhaven = L.marker( xy(-621480.5266714423, 876800.702993435), {
	icon: nodeCapital,
	title:'Sunhaven',
	alt: 'Sunhaven'
}).addTo(map)
.bindPopup(
	'<h3>Sunhaven</h3>'+
	'<dl>'+
	'<dt>Laboratory</dt>'+
        '<dd> - Journeyman Arcain Engineering</dd>'+
        '<dd> - Apprentice Alchemy</dd>'+
        '<dd> - Apprentice Scribing</dd>'+
	'</dl>'+
    '<dt>Textile Mill</dt>'+
        '<dd> - Journeyman Tailoring</dd>'+
        '<dd> - Apprentice Weaving</dd>'+
    '</dl>'
)
var aithanahr =L.marker( xy(-244314.91332819074, 753162.7173189586), {
	icon: nodeCapital,
	title:'Aithanahr',
	alt: 'Aithanahr'
}).addTo(map)
.bindPopup(
	'<h3>Aithanahr</h3>'+
	'<dl>'+
	'<dt>Trade Bureau</dt>'+
	'<dt>Stoneworks</dt>'+
        '<dd> - Journeyman Stoneworking</dd>'+
        '<dd> - Apprentice Mining</dd>'+
        '<dd> - Apprentice Jewelcrafting</dd>'+
    '<dt>Agricultural Supply</dt>'+
        '<dd> - Journeyman Animal Husbandry</dd>'+
        '<dd> - Apprentice Farming</dd>'+
        '<dd> - Apprentice herbalism</dd>'+
	'</dl>'
)
var azmaran = L.marker( xy(-281808.30078124994, 983673.2421875002), {
	icon: nodeCapital,
	title:'Azmaran',
	alt: 'Azmaran'
}).addTo(map)
.bindPopup(
	'<h3>Azmaran</h3>'+
	'<dl>'+
	'<dt>Trade Bureau</dt>'+
	'<dt>Woodshop</dt>'+
        '<dd> - Journeyman Lumberjacking</dd>'+
        '<dd> - Apprentice Carpentry</dd>'+
        '<dd> - Apprentice Lumbermilling</dd>'+
    '<dt>Smithy</dt>'+
        '<dd> - Journeyman Weaponsmithing</dd>'+
        '<dd> - Apprentice Metalworking</dd>'+
        '<dd> - Apprentice Armorsmithing</dd>'+
	'</dl>'
)
var lionhold = L.marker( xy(-810349.19487300003, 617070.57101700001), {
	icon: npcTown,
	title:'Lionhold',
	alt: 'Lionhold'
}).addTo(map)
.bindPopup(
	'<h3>Lionhold</h3>'
)
var lionholdTooltip= L.tooltip({
    className:'npcTownTooltip',
    permanent: true,
    content: 'Lionhold'
})    .setLatLng(xy(
    -810349.19487300003, 617070.57101700001
)).addTo(map);

var samiasHope = L.marker( xy(-732087.9097292366, 635753.7653969805), {
	icon: npcTown,
	title:'Samia\'s Hope',
	alt: 'Samia\'s Hope'
}).addTo(map)
.bindPopup(
	'<h3>Sami\'s Hope</h3>'
)
var samiasHopeTooltip= L.tooltip({
    className:'npcTownTooltip',
    permanent: true,
    content: 'Samia\'s Hope'
})    .setLatLng(xy(
    -732087.9097292366, 635753.7653969805
)).addTo(map);

var newAelaNode = L.polyline(
    [
        xy(-946296, 925147), 
        xy(-945834, 913160),
        xy(-816527.5714948195, 913435.6351426106),
        xy(-816650.503324276, 828120.9454997826),
        xy(-825419.6404921747, 820458.1947969926),
        xy(-827386.549763479, 798986.1019185862),
        xy(-849514.2790656534, 795380.1015878612),
        xy(-850046.9836599649, 756123.8707147444),
        xy(-856398.4615152187, 747928.4154176429),
        xy(-885697.2142023572, 725718.7315624973),
        xy(-923888.0358868507, 726702.18619815),
        xy(-974863.767834823, 732152.1639707224),
        xy(-989000.9282223232, 747600.597205759),
        xy(-1003056.1340568524, 747600.597205759),
        xy(-1005842.588857867, 759156.1891746721),
        xy(-1021454.9311988456, 760877.2347870634),
        xy(-1022520.3403874689, 773621.1677740568),
        xy(-1036329.682563085, 785176.7597429698),
        xy(-1056203.6616585567, 782513.2367714117),
        xy(-1103860.2342112025, 767474.5763012304),
        xy(-1116399.2808157683, 755673.1206734038),
        xy(-1129471.0320146452, 748829.915500324),
        xy(-1129716.8956735583, 748870.8927768097),
        xy(-1141149.555813015, 748010.3699706139),
        xy(-1152418.30684653, 732971.7095004326),
        xy(-1152336.3522935587, 721580.0266374614),
        xy(-1163891.944262472, 713343.5940638742),
        xy(-1205565.834448234, 715638.3215470627),
        xy(-1226914.9954971836, 717810.1172007945),
        xy(-1237569.0873834155, 730431.1183583312),
        xy(-1372425.304297223, 726702.18619815),
        xy(-1375088.827268781, 867582.062755327),
        xy(-1306697.7528144678, 865656.130760508),
        xy(-1308418.7984268593, 825006.6724868838),
        xy(-1227160.8591560966, 823162.6950450359),
        xy(-1223595.8361018575, 908928.1347292046),
        xy(-1255640.066313525, 910157.4530237695),
        xy(-1255681.0435900104, 922327.7041399656),
        xy(-946296, 925147),
    ],{color:"Yellow"}).addTo(map);
var newAelaTooltip = L.tooltip({
        className:'newAelaTooltip',
        permanent: true,
        content: 'New Aela'
    })    .setLatLng(xy(
        -1100008.370221565, 823695.3996393473
    )).addTo(map);

var sunhavenNode = L.polyline(
        [
            xy(-626474.9631550325, 704697.3887254321), 
            xy(-474203.40373488405, 705189.1160432579),
            xy(-473056.0399932901, 830743.4911948548),
            xy(-426751.71756466577, 830989.3548537678),
            xy(-426341.9447998107, 927040.0909357994),
            xy(-477153.7676418408, 927449.8637006541),
            xy(-488545.45050481195, 935399.4553388428),
            xy(-517475.40770358086, 935891.182656669),
            xy(-529440.7724373493, 945152.0471423937),
            xy(-712691.1528805417, 942775.3651062341),
            xy(-713838.516622136, 771408.3948438392),
            xy(-626311.0540490905, 769769.3037844189),
            xy(-626474.9631550325, 704697.3887254321),
        ],{color:"purple"}).addTo(map);
var sunhavenTooltip = L.tooltip({
            className:'sunhavenTooltip',
            permanent: true,
            content: 'Sun Haven'
        })    .setLatLng(xy(
            -587614.3871259234, 830121.1408846895
        )).addTo(map);

var azmaranNode = L.polyline(
        [
            xy(-488405.102054032, 935309.7840396193), 
            xy(-476965.1639460619, 927246.6951321943),
            xy(-426209.05300317105, 927108.8645525803),
            xy(-426588.0870971096, 846684.7213477552),
            xy(-394060.0703081829, 846684.7213477552),
            xy(-387857.6942255486, 835658.2749786271),
            xy(-317357.3527529382, 836485.2584563119),
            xy(-308742.9415270571, 843617.9909513412),
            xy(-308329.4497882147, 875112.2783931623),
            xy(-299508.2926929126, 884622.588386535),
            xy(-235865.02255610345, 884967.1648355703),
            xy(-235520.44610706842, 896820.5946823824),
            xy(-226147.96669330986, 902333.8178669467),
            xy(-225217.61028091455, 923559.7271275175),
            xy(-218222.7083654993, 930554.6290429326),
            xy(-219290.89535750845, 965425.7656852992),
            xy(-206024.70206965154, 978691.9589731558),
            xy(-205232.17623687064, 1074036.2624212075),
            xy(-316289.1657609288, 1073760.6012619792),
            xy(-343476.2475898094, 1056049.3717815676),
            xy(-344406.6040022047, 1018214.877677498),
            xy(-376348.8408277714, 1017353.43655491),
            xy(-383998.4379963538, 1002605.5645362019),
            xy(-423245.695541468, 1004018.3279772464),
            xy(-421936.30503513385, 981724.2317246664),
            xy(-462458.49544167845, 982241.0963982191),
            xy(-462904.65255254053, 946196.2330549896),
            xy(-478493.3693742135, 945211.0725123557),
            xy(-488405.102054032, 935309.7840396193),
        ],{color:"red"}).addTo(map);

var azmaranTooltip = L.tooltip({
            className:'azmaranTooltip',
            permanent: true,
            content: 'Azmaran'
        })    .setLatLng(xy(
            -343758.1775140297, 942545.3439852298
        )).addTo(map);



var aithanahrNode = L.polyline(
        [
            xy(-307088.9745716879, 594661.5065233796), 
            xy(-177378.9062500001, 595559.4238281249),
            xy(-169167.8222656249, 601918.7499999999),
            xy(-170288.6230468751, 637467.626953125),
            xy(-153433.28340632626, 650689.3383175321),
            xy(-154457.71531846406, 680807.6365343805),
            xy(-137001.3955356375, 685847.8415420981),
            xy(-135116.44081730404, 825170.5815928257),
            xy(-189288.40033114597, 825088.6270398548),
            xy(-192894.4006618707, 828899.5137530069),
            xy(-192276.10175314549, 884932.707190667),
            xy(-299646.1232725268, 884657.0460314387),
            xy(-308398.3650780218, 875008.905458452),
            xy(-308949.68739647826, 843652.448596245),
            xy(-303436.4642119145, 836829.8349053472),
            xy(-291307.3732058738, 836829.8349053472),
            xy(-290920.8984375, 827662.646484375),
            xy(-292187.89062499994, 809047.6074218752),
            xy(-293795.99609374994, 803273.0468750002),
            xy(-312191.748046875, 782635.693359375),
            xy(-314473.9799943734, 720965.3674901784),
            xy(-306565.36563267023, 714327.0486995262),
            xy(-307088.9745716879, 594661.5065233796),
        ],{color:"SpringGreen"}).addTo(map);
var aithanahrTooltip = L.tooltip({
            className:'aithanahrTooltip',
            permanent: true,
            content: 'Aithanahr'
        })    .setLatLng(xy(
            -240142.46867703676, 739718.1734430176
        )).addTo(map);
var miralethNode = L.polyline(
        [
            xy(-631598.9078235062, 679362.602551671),
            xy(-629367.8089475418, 669134.318094328),
            xy(-625311.2655366975, 660731.4781718649),
            xy(-616937.400924312, 627380.8962727095),
            xy(-616850.4749940794, 620861.4515052814),
            xy(-620443.4134436845, 608488.9941022063),
            xy(-620791.117164614, 599883.3270092014),
            xy(-611084.3882886653, 580904.4989084656),
            xy(-608563.5363119263, 572472.6836759249),
            xy(-608157.8819708419, 561577.9670868007),
            xy(-612098.5241413764, 538455.6696449883),
            xy(-603840.5607693006, 529241.5210403566),
            xy(-597697.7950328792, 518404.75507138704),
            xy(-591178.3502654511, 509943.9645287688),
            xy(-586571.275963135, 498151.01332724286),
            xy(-582659.609102678, 494384.2230171734),
            xy(-569997.3985988285, 488212.4819706744),
            xy(-566810.1144903081, 472073.23425752996),
            xy(-565998.8058081393, 463989.1227459189),
            xy(-550265.212436079, 453413.13456764625),
            xy(-544644.0022810522, 438403.92394752294),
            xy(-521666.5813896272, 422873.15774600505),
            xy(-514480.7044904173, 409921.1941413805),
            xy(-509728.753637714, 390391.8351491732),
            xy(-511032.64259119966, 383379.8101104282),
            xy(-506193.7658082642, 364777.66104069963),
            xy(-503846.76569198986, 357707.6853818),
            xy(-485824.1228238106, 342669.49945159856),
            xy(-458355.5288703796, 325081.48623458087),
            xy(-456588.0349556546, 266348.5327075718),
            xy(-390205.5995681962, 267652.42166105774),
            xy(-385366.7227852605, 651053.7246059934),
            xy(-418340.62565340876, 652038.8851486272),
            xy(-419007.05778519023, 679217.7260012837),
            xy(-474436.8259633692, 680347.7630943044),
            xy(-474233.9987928271, 704484.1963888276),
            xy(-593177.6466607958, 705121.6532105318),
            xy(-608911.2400328558, 700601.5048384485),
            xy(-628730.3521258378, 691097.6031330418),
            xy(-631714.8090638159, 679449.5284819031),
            xy(-631598.9078235062, 679362.602551671),
        ],{color:"blue"}).addTo(map);

var miraletTooltip = L.tooltip({
            className:'miraletTooltip',
            permanent: true,
            content: 'Miraleth'
        })    .setLatLng(xy(
            -500456.6544129273, 511624.5325132614
        )).addTo(map);

var winsteadNode = L.polyline(
        [
            xy(-772405.011348878, 545042.4978623049),
            xy(-795367.3603813036, 544482.5341411),
            xy(-808869.8548773994, 533993.4718930594),
            xy(-847464.9679005749, 532718.5582496516),
            xy(-851115.8569703347, 513536.90297837346),
            xy(-865313.7589082895, 502526.2851489395),
            xy(-871108.8209237813, 494355.2477070958),
            xy(-875802.8211563295, 482011.7656140984),
            xy(-878642.4015439205, 469378.53042032645),
            xy(-878004.9447222163, 457266.85080794845),
            xy(-870065.7097609926, 444865.4180947959),
            xy(-861720.8204586846, 432637.8372421087),
            xy(-859113.0425517133, 413919.7869320699),
            xy(-849377.3383656872, 391550.8475522719),
            xy(-836454.3500711404, 383611.6125910481),
            xy(-818141.9541021864, 375730.32824997953),
            xy(-791021.0638696848, 360489.31514923566),
            xy(-776359.5569704908, 356954.3273197861),
            xy(-762915.0130945498, 349536.64793995634),
            xy(-753469.0620092982, 318648.96739738545),
            xy(-743617.4565829622, 301089.92949044536),
            xy(-737590.5920868508, 281792.3729788575),
            xy(-739271.1600713434, 268985.2859246207),
            xy(-747731.9506139613, 254497.6308858913),
            xy(-766160.2478232251, 236706.79049833177),
            xy(-769927.0381332949, 217583.0858472087),
            xy(-770390.6430945342, 165543.42894809257),
            xy(-633858.9820095479, 172265.70088606304),
            xy(-635539.5499940405, 190983.7511961013),
            xy(-608013.0054204545, 193301.7760022981),
            xy(-609635.6227847923, 206514.51739761914),
            xy(-580138.757125939, 209006.3940642808),
            xy(-581935.2263507417, 223262.24662239078),
            xy(-547802.311079495, 225464.37018827736),
            xy(-549193.125963213, 265334.39685486094),
            xy(-457689.09673859784, 266261.60677733965),
            xy(-459659.41782386525, 325429.18995551055),
            xy(-475248.13464553794, 337946.5239089728),
            xy(-502369.0248780396, 353187.5370097161),
            xy(-506657.3707695036, 365125.3647616293),
            xy(-511061.61790127726, 383553.66197089304),
            xy(-509670.80301755917, 390797.489490258),
            xy(-515176.1119322764, 410500.7003429301),
            xy(-522709.69255241565, 422844.1824359275),
            xy(-538298.4093740886, 437911.343676206),
            xy(-547570.5085988753, 452804.6530560196),
            xy(-565187.4971259703, 463931.17212576437),
            xy(-565419.29960659, 464105.0239862286),
            xy(-567331.6700717022, 472681.7157691566),
            xy(-570171.2504592933, 487806.8276295902),
            xy(-587092.8315445292, 497948.186156701),
            xy(-591497.0786763032, 510813.2238310924),
            xy(-598045.4987538088, 517999.1007303023),
            xy(-603840.5607693006, 528777.9160791173),
            xy(-612475.2031723834, 537992.0646837489),
            xy(-659225.7812500001, 566540.4296874999),
            xy(-772405.011348878, 545042.4978623049),
        ],{color:"orange"}).addTo(map);
var winsteadTooltip = L.tooltip({
            className:'winsteadTooltip',
            permanent: true,
            content: 'Winstead'
        })    .setLatLng(xy(
            -663124.21875, 360410.5468749998
        )).addTo(map);

var halcyonNode = L.polyline(
        [
            xy(-1098384.7656250002, 433603.7109375),
            xy(-1081913.8671875, 386822.4609375),
            xy(-1052675.5859375, 338189.4531249998),
            xy(-1021000.78125, 305734.9609374998),
            xy(-987766.6015624999, 263144.53125),
            xy(-974804.296875, 223672.8515625),
            xy(-941082.8125000001, 204667.96875),
            xy(-916717.5781249999, 193265.0390625),
            xy(-869713.4005564302, 161597.82537588786),
            xy(-780123.5238072674, 160770.84189820368),
            xy(-769097.0774381397, 165594.9121846968),
            xy(-770303.095009763, 217212.46425017618),
            xy(-766753.9575847002, 236336.45717163183),
            xy(-758553.0380976615, 246225.80125894307),
            xy(-745631.4212588398, 256666.46766471132),
            xy(-739739.1639803372, 268140.8634175844),
            xy(-737947.366445354, 281579.344929959),
            xy(-738291.9428943893, 281475.97199524863),
            xy(-744184.2001728918, 301737.0671985205),
            xy(-750593.3221249473, 309593.4102365243),
            xy(-751937.1702761847, 317622.04149904544),
            xy(-757863.8851995908, 327511.3855863567),
            xy(-761378.5649797503, 342466.00347448606),
            xy(-763756.1424780934, 351562.8217290164),
            xy(-776402.0981576868, 358075.31661578274),
            xy(-788324.4432943063, 358213.1471953968),
            xy(-804071.5870152168, 367034.3042906989),
            xy(-818853.9166788284, 376372.3260595542),
            xy(-839735.2494903642, 386675.1618857078),
            xy(-851106.2723085271, 395013.9119523605),
            xy(-860168.632918154, 414275.7354534308),
            xy(-864096.8044371558, 435088.1529751592),
            xy(-877259.6247903019, 453419.6200638339),
            xy(-985008.680403622, 454384.43412113277),
            xy(-984285.0698606479, 435846.2211630368),
            xy(-1098477.705070927, 433227.4401503691),
            xy(-1098384.7656250002, 433603.7109375),
        ],{color:"aqua"}).addTo(map);

var halcyonTooltip = L.tooltip({
            className:'halcyonTooltip',
            permanent: true,
            content: 'Halcyon'
        })    .setLatLng(xy(
            -920036.1599452223, 306890.00036176847
        )).addTo(map);
var joevaNode = L.polyline(
        [
            xy(-1162196.859031644, 712883.7920918082),
            xy(-1165632.8125000002, 459528.3203124998),
            xy(-1131813.8671875, 431459.5703124998),
            xy(-1098189.84375, 435163.0859375002),
            xy(-984647.8515625001, 436722.4609374998),
            xy(-984745.3125, 454265.4296874998),
            xy(-877733.203125, 453583.2031250002),
            xy(-878787.2780943078, 458020.2088699623),
            xy(-879163.9571253147, 468943.90076916467),
            xy(-876440.2779780336, 481345.33348231664),
            xy(-870819.0678230065, 495688.1119706588),
            xy(-863807.0427842615, 504119.9272031995),
            xy(-851144.832280412, 514058.4585597679),
            xy(-848479.1037532857, 522374.3725519989),
            xy(-847291.11604011, 532254.9532884123),
            xy(-854940.5979005593, 541382.1759628117),
            xy(-861141.3142571353, 548017.5219705495),
            xy(-865458.6354586768, 551349.6826294577),
            xy(-878845.2287144626, 558274.7817379701),
            xy(-884524.3894896447, 567344.053792215),
            xy(-885828.2784431304, 572791.412086777),
            xy(-886378.8093346022, 583628.1780557467),
            xy(-885741.3525128979, 616167.4512727332),
            xy(-883684.1054973984, 619963.2168928802),
            xy(-875368.1915051677, 628395.0321254209),
            xy(-874730.7346834635, 654154.0827842817),
            xy(-885393.6487919684, 665657.2808850331),
            xy(-887219.0933268485, 724969.7406135913),
            xy(-923003.6012725102, 725954.9011562245),
            xy(-975188.1347220136, 731431.2347608642),
            xy(-989472.9621561618, 746527.3709916762),
            xy(-1003381.1114273809, 746962.0009623825),
            xy(-1006191.7165048944, 758233.396582514),
            xy(-1021954.2851870323, 760667.3226290205),
            xy(-1023113.2975901304, 773010.804722018),
            xy(-1037514.0266986276, 783441.9163499033),
            xy(-1055565.6448768845, 781819.2989855653),
            xy(-1103345.9311946142, 766839.063675519),
            xy(-1117584.5703125, 747671.5820312499),
            xy(-1137076.7578125, 741239.1601562499),
            xy(-1144581.2500000002, 733149.90234375),
            xy(-1150282.7148437502, 712341.9921875002),
            xy(-1162196.859031644, 712883.7920918082),
        ],{color:"Magenta"}).addTo(map);

var joevaTooltip = L.tooltip({
            className:'joevaTooltip',
            permanent: true,
            content: 'Joeva'
        })    .setLatLng(xy(
            -1027232.7271833024, 584224.1958580379
        )).addTo(map);
var groupNodes = L.layerGroup([
    winsteadNode,
    winsteadTooltip,
    azmaranNode,
    azmaranTooltip,
    aithanahrNode,
    aithanahrTooltip,
    sunhavenNode,
    sunhavenTooltip,
    miralethNode,
    miraletTooltip,
    newAelaNode,
    newAelaTooltip,
    joevaNode,
    joevaTooltip,
    halcyonNode,
    halcyonTooltip]);

//PVP ZONES        
var desertLowlesZone = L.polyline(
        [
            xy(-472564.31267546373, 829760.0365592028),
            xy(-473711.67641705804, 681258.3865757211),
            xy(-418146.48950270895, 680111.0228341271),
            xy(-417654.7621848829, 652574.2930358653),
            xy(-385200.7592083605, 650935.201976445),
            xy(-385200.7592083605, 595206.1059561543),
            xy(-307999.57030966313, 595042.1968502118),
            xy(-307016.1156740108, 713384.5713403594),
            xy(-314719.8436532865, 721743.9357434034),
            xy(-312752.93438198214, 782718.1231538394),
            xy(-293739.47809270624, 803862.3978203619),
            xy(-291445.203785488, 836554.1737461189),
            xy(-303436.4642119145, 836760.9196155401),
            xy(-309156.4332658994, 843514.6180166309),
            xy(-317081.69159371, 836278.5125868907),
            xy(-388133.35538477683, 835589.3596888201),
            xy(-394197.900887797, 846546.890768141),
            xy(-426794.8329665308, 846409.0601885269),
            xy(-426657.00238691666, 830627.4588227129),
            xy(-473174.8230066744, 830213.9670838704),
            xy(-472564.31267546373, 829760.0365592028),
        ],{color:"DarkOrchid"}).addTo(map).bindTooltip("PVP Zone");

var windandseaLowlesZone = L.polyline(
        [
            xy(-1223134.765625, 506017.1874999998),
            xy(-1286864.750995482, 581929.4683748494),
            xy(-1468476.0403792541, 518332.73526934104),
            xy(-1572394.4135465028, 493418.5511661516),
            xy(-1572722.231758387, -21583.859703714945),
            xy(-918069.2626259087, 2019.0515519380124),
            xy(-918397.0808377925, 193792.7055041163),
            xy(-971175.8129511271, 219362.52603107342),
            xy(-983699.2898972882, 261938.4873349501),
            xy(-991142.1411964493, 271862.2890671651),
            xy(-1009473.6082851243, 286885.8222451015),
            xy(-1032353.4845010642, 309765.69846104167),
            xy(-1053165.902022793, 336091.3391673343),
            xy(-1082248.1543213672, 381851.0915992141),
            xy(-1100717.4519896563, 408314.5628851209),
            xy(-1131178.0100843713, 418651.8563561783),
            xy(-1146752.8655807644, 433399.72837488644),
            xy(-1151714.7664468717, 454901.2987946854),
            xy(-1186723.7336688524, 474197.579940659),
            xy(-1215668.1553878128, 499696.2371692669),
            xy(-1223134.765625, 506017.1874999998),
        ],{color:"DarkOrchid"}).addTo(map).bindTooltip("PVP Zone");

var groupPVPZones = L.layerGroup([desertLowlesZone,windandseaLowlesZone]);


var groupTowns = L.layerGroup([winstead,azmaran,aithanahr,sunhaven,miraleth,newAela,joeva,halcyon]);

var groupNPCTowns = L.layerGroup([lionhold,samiasHope]);
//sidebar 
var sidebar = L.control.sidebar('sidebar').addTo(map);
//coordinate system
L.control.coordinates({
        position:"bottomleft", //optional default "bootomright"
        decimals:0, //optional default 4
        decimalSeperator:".", //optional default "."
        labelTemplateLat:"Latitude: {y}", //optional default "Lat: {y}"
        labelTemplateLng:"Longitude: {x}", //optional default "Lng: {x}"
        enableUserInput:true, //optional default true
        useDMS:false, //optional default false
        useLatLngOrder: false, //ordering of labels, default false-> lng-lat
        markerType: L.marker, //optional default L.marker
        markerProps: {}, //optional default {},
        labelFormatterLng : function(lng){return "X: "+Math.round(lng/scaleX)}, //optional default none,
        labelFormatterLat : function(lat){return "Y: "+Math.round(lat/scaleY)}, //optional default none
    }).addTo(map);
//GROUP CONTROLS
//Marker Overlay
var overlays={
    "Whipping Willows" : groupWillows,
    "Player Cities":groupTowns,
    "NPC Cities":groupNPCTowns,
    "Points Of Intrest": groupPOI,
    "Starter Crafting Stations": starterPOI,
    "Nodes": groupNodes,
    "Lowless PVP Zones": groupPVPZones,
    };

//GROUP CONTROLS
  L.control.layers(null, overlays).addTo(map);

// add Leaflet-Geoman controls with some options to the map  
map.pm.addControls({  
    position: 'topleft',  
    drawCircleMarker: false,
    rotateMode: false,
  }); 


//DISCORD oAuth  onLoad
  window.onload = async () => {

    // get code from URL
    const fragment = new URLSearchParams(window.location.search);
    const code = fragment.get('code') ;
    var profile  = await getProfile(); 
    if (code) {
      // if there is code but no token (code not yet exchanged), 
      // exchange code for tokens and save tokens in localStorage
      window.history.replaceState({}, document.title, "/");  // set url to "/"
      const result = await getToken(code) 
      if (result.token_type && result.access_token) {
        // get the user info
        const user= await getMe();
        var profile  = await getProfile(); 
      }
    }
  }