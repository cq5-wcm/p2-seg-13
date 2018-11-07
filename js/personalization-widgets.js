/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

// initialize CQ.personalization package
CQ.personalization = {};


CQ.Ext.StoreMgr.register(new CQ.Ext.data.SimpleStore({
    storeId: "clickstreamstore",
    data: [],
    fields: ["key", "value"],
    id: 0
}));


CQ_Analytics.ClickstreamcloudMgr.addListener("storesloaded", function(e) {
    var data = new Array();
    var dataMgrs = {
        profile: CQ_Analytics.ProfileDataMgr,
        pagedata: CQ_Analytics.PageDataMgr,
        surferinfo: CQ_Analytics.SurferInfoMgr,
        eventdata: CQ_Analytics.EventDataMgr
    };
    for(var mgr in dataMgrs) {
        if( dataMgrs[mgr] ) {
            var profileNames = dataMgrs[mgr].getPropertyNames();
            var title = CQ_Analytics.ClickstreamcloudMgr.getUIConfig(mgr).title;
            for(var i=0; i < profileNames.length; i++) {
                if (!CQ.shared.XSS.KEY_REGEXP.test(profileNames[i])) {
                    data.push([mgr + "." + profileNames[i], mgr + "." + profileNames[i] ]);
                }
            }
        }
    }
    CQ.Ext.StoreMgr.lookup("clickstreamstore").loadData(data);
});

/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */
/**
 * @class CQ.personalization.EditableClickstreamcloud
 * @extends CQ.Dialog
 * EditableClickstreamcloud is a dialog allowing to edit the Clickstreamcloud by providing access to the properties
 * of the Clickstreamcloud session stores.
 * It mainly contains {@link CQ.personalization.EditableClickstreamcloud.FormSection FormSection}.
 * @deprecated since 5.5
 * @constructor
 * Creates a new EditableClickstreamcloud.
 * @param {Object} config The config object
 */
CQ.personalization.EditableClickstreamcloud = CQ.Ext.extend(CQ.Dialog, {
    constructor: function(config) {
        config = (!config ? {} : config);
        this.fieldsContainer = new CQ.Ext.TabPanel({});
        var currentObj = this;
        var defaults = {
            "id": "cq-editable-clickstreamcloud",
            "title": CQ.I18n.getMessage("Edit the current Clickstream Cloud"),
            "width": 400,
            "height": 400,
            "warnIfModified": false,
            "animCollapse": false,
            "collapsible": true,
            "stateful": true,
            "items": this.fieldsContainer,
            "buttons": [{
                "text": CQ.I18n.getMessage("Add"),
                "tooltip": CQ.I18n.getMessage("Add a new property"),
                "handler": function() {
                    var section = currentObj.getActiveSection();
                    if (section) {
                        section.addFieldHandler();
                    }
                }
            },{
                "text": CQ.I18n.getMessage("Remove"),
                "tooltip": CQ.I18n.getMessage("Remove the selected property"),
                "handler": function() {
                    var section = currentObj.getActiveSection();
                    if (section) {
                        section.removeFieldHandler();
                    }
                },
                "listeners": {
                    "mouseover": function() {
                        var section = currentObj.getActiveSection();
                        if (section) {
                            if (section.lastSelectedItem) {
                                section.lastSelectedItemToDelete = section.lastSelectedItem;
                            } else {
                                section.lastSelectedItemToDelete = null;
                            }
                        }
                    },
                    "mouseout": function() {
                        var section = currentObj.getActiveSection();
                        if (section) {
                            section.lastSelectedItemToDelete = null;
                        }
                    }
                }
            },{
                "text": CQ.I18n.getMessage("Reset"),
                "tooltip": CQ.I18n.getMessage("Revert the current properties to the intial values"),
                "handler": function() {
                    var section = currentObj.getActiveSection();
                    if (section) {
                        section.reset();
                    }
                }
            },{
                "text": CQ.I18n.getMessage("Done"),
                "tooltip": CQ.I18n.getMessage("Close the current dialog"),
                "handler": function() {
                    currentObj.hide();
                }
            }],
            "listeners": {
            	"beforeshow": function(cmp) {
                    if(window.CQ_Analytics
                        && window.CQ_Analytics.Sitecatalyst) {
                    	currentObj.reload();
                    }
            	}
            }
        };

        CQ.Util.applyDefaults(config, defaults);

        // init component by calling super constructor
        CQ.personalization.EditableClickstreamcloud.superclass.constructor.call(this, config);
    },

    /**
     * Returns the active displayed section.
     * @return {CQ.personalization.EditableClickstreamcloud.FormSection} The active section.
     * @private
     */
    getActiveSection: function() {
        return this.fieldsContainer.layout.activeItem;
    },

    /**
     * Adds the given section to the main tab.
     * @param {CQ.personalization.EditableClickstreamcloud.FormSection} section Section to add.
     * @private
     */
    addSection: function(section) {
        if (section) {
            this.fieldsContainer.add(section);
            this.fieldsContainer.doLayout();
            var ai = this.getActiveSection();
            if( !ai ) {
                this.fieldsContainer.setActiveTab(0);
            }
        }
    },

    /**
     * Registers a session store to the current EditableClickstreamcloud.
     * @param {Object} config Config object. Expected configs are: <ul>
     * <li><code>sessionStore:</code> session store to be editable</li>
     * <li><code>mode:</code> one of the following UI modes: <code>{@link #EditableClickstreamcloud.MODE_TEXTFIELD MODE_TEXTFIELD}</code>,
     * <code>{@link #EditableClickstreamcloud.MODE_LINK MODE_LINK}</code>
     * or <code>{@link #EditableClickstreamcloud.MODE_STATIC MODE_STATIC}</code> (default)</li>
     * <li><code>title:</code> section title</li>
     * <li><code>sectionConfig:</code> initial section config</li>
     * </ul>
     */
    register: function(config /*sessionStore, mode, title, sectionConfig*/) {
        var section = new CQ.personalization.EditableClickstreamcloud.FormSection(config);
        this.addSection(section);
    },

    /**
     * Reloads each of the contained sections.
     * @private
     */
    reload: function() {
        this.fieldsContainer.items.each(function(item,index,length) {
            if(item.reload) {
                item.reload();
            }
            return true;
        });
    }
});

/**
 * @class CQ.personalization.EditableClickstreamcloud.FormSection
 * @extends CQ.Ext.Panel
 * FormSection is a panel providing UI to access and edit the properties of a Clickstreamcloud session store.
 * @deprecated since 5.5
 * @constructor
 * Creates a new FormSection.
 * @param {Object} config The config object
 */
CQ.personalization.EditableClickstreamcloud.FormSection = CQ.Ext.extend(CQ.Ext.Panel, {
    /**
     * @cfg {CQ.form.Field} newPropertyNameField
     * The field config to specify the name of a new property (defaults to a textfield).
     */
    newPropertyNameField: null,

    /**
     * @cfg {CQ.form.Field} newPropertyValueField
     * The field config to specify the value of a new property (defaults to a textfield).
     */
    newPropertyValueField: null,

    /**
     * @cfg {String} mode Display mode
     * Session store properties will be displayed depending on this property with:<ul>
     * <li><code>{@link CQ.personalization.EditableClickstreamcloud#EditableClickstreamcloud.MODE_TEXTFIELD EditableClickstreamcloud.MODE_TEXTFIELD}:</code> a textfield</li>
     * <li><code>{@link CQ.personalization.EditableClickstreamcloud#EditableClickstreamcloud.MODE_LINK EditableClickstreamcloud.MODE_LINK}:</code> a link (not editable)</li>
     * <li><code>{@link CQ.personalization.EditableClickstreamcloud#EditableClickstreamcloud.MODE_STATIC EditableClickstreamcloud.MODE_STATIC}</code> (default): a static text (not editable)</li>
     * </ul>
     */
    mode: null,

    /**
     * @cfg {CQ_Analytics.SessionStore} sessionStore
     * The session store to display and edit.
     */
    sessionStore: null,

    /**
     * @cfg {String} title
     * The section title.
     */
    title: null,

    constructor: function(config) {
        config = (!config ? {} : config);

        config.newPropertyNameField = config.newPropertyNameField || {};
        config.newPropertyValueField = config.newPropertyValueField || {};

        var currentObj = this;
        var defaults = {
            "layout": "form",
            "autoScroll": true,
            "bodyStyle": CQ.themes.Dialog.TAB_BODY_STYLE,
            "labelWidth": CQ.themes.Dialog.LABEL_WIDTH,
            "defaultType": "textfield",
            "stateful": false,
            "border": false,
            "defaults": {
                "anchor": CQ.themes.Dialog.ANCHOR,
                "stateful": false
            }
        };

        CQ.Util.applyDefaults(config, defaults);

        // init component by calling super constructor
        CQ.personalization.EditableClickstreamcloud.FormSection.superclass.constructor.call(this, config);
    },

    initComponent: function() {
        CQ.personalization.EditableClickstreamcloud.FormSection.superclass.initComponent.call(this);
        this.loadFields();
    },

    /**
     * Resets the session store and reloads the fields.
     */
    reset: function() {
        this.sessionStore.reset();
        for (var i = this.items.items.length - 1; i >= 0; i--) {
            this.remove(this.items.items[i]);
        }

        this.reload();
    },

    /**
     * Reloads the fields.
     */
    reload: function() {
        this.removeAllFields();
        this.loadFields();
        this.doLayout();
    },

    /**
     * Shows a dialog used to add a property/value pair in the store.
     * New property name field is defined set by {@link newPropertyNameField} config.
     * New property value field is defined set by {@link newPropertyNameField} config.
     * @private
     */
    addFieldHandler: function() {
        var currentObj = this;

        var newPropertyNameConfig = CQ.Util.applyDefaults(this.newPropertyNameField, {
            "xtype": "textfield",
            "name": "newPropertyName",
            "fieldLabel": CQ.I18n.getMessage("Name"),
            "allowBlank": false
        });

        var newPropertyName = CQ.Util.build(newPropertyNameConfig);

        var newPropertyValueConfig = CQ.Util.applyDefaults(this.newPropertyValueField, {
            "xtype": "textfield",
            "name": "newPropertyValue",
            "fieldLabel": CQ.I18n.getMessage("Value")
        });

        var newPropertyValue = CQ.Util.build(newPropertyValueConfig);

        var dialog = new CQ.Dialog({
            "height": 250,
            "width": 400,
            "title": CQ.I18n.getMessage("Add new property to {0}", this.title),
            "items": {
                "xtype": "panel",
                items: [newPropertyName, newPropertyValue]
            },
            "buttons": [
                {
                    "text": CQ.I18n.getMessage("OK"),
                    "handler":function() {
                        if (newPropertyName.isValid()) {
                            var names = newPropertyName.getValue();
                            if (!(names instanceof Array)) {
                                names = [names];
                            }
                            var labels = null;
                            if (newPropertyName.getLabel) {
                                labels = newPropertyName.getLabel();
                                if (!labels instanceof Array) {
                                    labels = [labels];
                                }
                            }
                            for (var i = 0; i < names.length; i++) {
                                var name = names[i];
                                var label = (labels != null && i < labels.length) ? labels[i] : names[i];
                                var value = newPropertyValue.getValue();
                                currentObj.sessionStore.setProperty(name, value);
                                currentObj.addField(label, value, name);
                            }
                            currentObj.doLayout();
                            dialog.hide();
                        }
                    }
                },
                CQ.Dialog.CANCEL
            ]});
        dialog.show();
    },

    /**
     * Removes the selected field.
     * @private
     */
    removeFieldHandler: function() {
        if (this.lastSelectedItemToDelete) {
            this.sessionStore.removeProperty(this.lastSelectedItemToDelete.getName());
            this.remove(this.lastSelectedItemToDelete);
            this.lastSelectedItemToDelete = null;
        }
    },

    /**
     * Removes all the fields.
     * @private
     */
    removeAllFields: function() {
        if( this.items ) {
            this.items.each(function(item,index,length) {
                this.remove(item);
                return true;
            },this);
        }
    },

    /**
     * Loads a field for each non invisible session store property.
     * @private
     */
    loadFields: function() {
        var storeConfig = CQ_Analytics.CCM.getStoreConfig(this.sessionStore.getName());
        var names = this.sessionStore.getPropertyNames(storeConfig["invisible"]);
        for (var i = 0; i < names.length; i++) {
            var name = names[i];

            //exclude xss properties
            if( !CQ.shared.XSS.KEY_REGEXP.test(name)) {
                this.addField(this.sessionStore.getLabel(name), this.sessionStore.getProperty(name, true), name, this.sessionStore.getLink(name));
            }
        }
    },

    /**
     * Adds a field to the section.
     * @param {String} label Label.
     * @param {String} value Value.
     * @param {String} name Name.
     * @param {String} link (optional) Link (only if section mode is <code>{@link CQ.personalization.EditableClickstreamcloud#EditableClickstreamcloud.MODE_LINK EditableClickstreamcloud.MODE_LINK}</code>)
     */
    addField: function(label, value, name, link) {
        if (this.mode == CQ.personalization.EditableClickstreamcloud.MODE_TEXTFIELD) {
        	 if(!CQ_Analytics.Sitecatalyst) {
        		 this.addTextField(label, value, name);
        	 } else {
        		 this.addTriggerField(label, value, name);
        	 }
        } else {
            if (this.mode == CQ.personalization.EditableClickstreamcloud.MODE_LINK && link) {
                this.addLink(label, link);
            } else {
                this.addStaticText(label);
            }
        }
    },

    /**
     * Handles a property change: updates the session store.
     * @param {String} name Property name.
     * @param {String} newValue The new value.
     * @param {String} oldValue The old value.
     * @private
     */
    onPropertyChange: function(name, newValue, oldValue) {
        //copy property value to xss property for display
        if( this.sessionStore.getPropertyNames().indexOf(name + CQ.shared.XSS.KEY_SUFFIX) != -1) {
            this.sessionStore.setProperty(name + CQ.shared.XSS.KEY_SUFFIX, newValue);
        }
        this.sessionStore.setProperty(name, newValue);
    },

    /**
     * Add a triggerfield to the section.
     * @param {String} label Label.
     * @param {String} value Default value.
     * @param {String} name Field name.
     */
    addTriggerField: function(label, value, name) {
    	var currentObj = this;

        var tf = new CQ.Ext.form.TriggerField({
            "fieldLabel": label,
            "value": value,
            "name": name,
            "listeners": {
                "change": function(field, newValue, oldValue) {
                    currentObj.onPropertyChange(name, newValue, oldValue);
                },
                "destroy": function() {
                    if( this.container ) {
                        this.container.parent().remove();
                    }
                },
                "focus": function() {
                    currentObj.lastSelectedItem = tf;
                },
                "blur": function() {
                    if (currentObj.lastSelectedItem === tf) {
                        currentObj.lastSelectedItem = null;
                    }
                }
            }
        });

        tf.onTriggerClick = function(e) {
            var dialog = new CQ.personalization.SitecatalystDialog({
                profileLabel: currentObj.sessionStore.STORENAME + "." + label
            });
            dialog.show();
            dialog.alignToViewport("c");
        };

        this.add(tf);
    },

    /**
     * Adds a textfield to the section.
     * @param {String} label Label.
     * @param {String} value Default value.
     * @param {String} name Field name.
     */
    addTextField: function(label, value, name) {
        var currentObj = this;

        var tf = new CQ.Ext.form.TriggerField({
            "fieldLabel": label,
            "value": value,
            "name": name,
            "listeners": {
                "change": function(field, newValue, oldValue) {
                    currentObj.onPropertyChange(name, newValue, oldValue);
                },
                "destroy": function() {
                    if( this.container ) {
                        this.container.parent().remove();
                    }
                },
                "focus": function() {
                    currentObj.lastSelectedItem = tf;
                },
                "blur": function() {
                    if (currentObj.lastSelectedItem === tf) {
                        currentObj.lastSelectedItem = null;
                    }
                }
            }
        });

        this.add(tf);
    },

    /**
     * Adds a link to the section.
     * @param {String} text Link text.
     * @param {String} href Link href.
     */
    addLink: function(text, href) {
        if (href) {
            this.add(new CQ.Static({
                "html": "<a href=" + href + ">" + text + "</a>"
            }));
        } else {
            this.addStaticText(text);
        }
    },

    /**
     * Adds a static text to the section.
     * @param {String} text Text to add.
     */
    addStaticText: function(text) {
        if (text) {
            this.add(new CQ.Static({
                "html": text
            }));
        }
    }
});

/**
 * Textfield display mode: property is displayed with a textfield.
 * @static
 * @final
 * @type String
 * @member CQ.personalization.EditableClickstreamcloud
 */
CQ.personalization.EditableClickstreamcloud.MODE_TEXTFIELD = "textfield";

/**
 * Link display mode: property is displayed with a link.
 * @static
 * @final
 * @type String
 * @member CQ.personalization.EditableClickstreamcloud
 */
CQ.personalization.EditableClickstreamcloud.MODE_LINK = "link";

/**
 * Static display mode: property is displayed with a static text.
 * @static
 * @final
 * @type String
 * @member CQ.personalization.EditableClickstreamcloud
 */
CQ.personalization.EditableClickstreamcloud.MODE_STATIC = "static";
/*
 * ***********************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2011 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 * ***********************************************************************
 */

if( window.CQ_Analytics
    && window.CQ_Analytics.ClientContextUI ) {
    $CQ(function() {
        CQ_Analytics.ClientContextUI.addListener("render", function() {
            CQ_Analytics.ClientContextUI.ipe = new CQ.ipe.PlainTextEditor({
                "enterKeyMode": "save",
                "tabKeyMode": "save"
            });
        });

        var handleInPlaceEdition = function(event) {
            var ipe = CQ_Analytics.ClientContextUI.ipe;
            var $t = $CQ(this);
            var $parent = $t.parent();

            var store = $t.attr("data-store");
            var property = $t.attr("data-property");
            var propertyPath = "/" + store + "/" + property;

            var stop = function() {
                if( ipe.running ) {
                    if( !ipe.isCancelled ) {
                        ipe.finish();
                    } else {
                        CQ_Analytics.ClientContext.set(
                            ipe.editComponent.propertyPath,
                            ipe.editComponent.initialValue
                        );
                        ipe.cancel();
                    }
                    $CQ(document).unbind("click",handleDocumentClick);
                    ipe.editComponent.parent.removeClass("cq-clientcontext-editing");
                    ipe.running = false;
                    ipe.isCancelled = false;
                }
                delete ipe.clicked;
            };

            if( ! ipe.running ) {
                var initialValue = CQ_Analytics.ClientContext.get(propertyPath);
                if( typeof(initialValue) == "string" && initialValue.toLowerCase().indexOf("http") == 0) {
                    initialValue= initialValue.replace(new RegExp("&amp;","g"),"&");
                }

                var handleDocumentClick = function() {
                    if( !ipe.clicked || ipe.clicked != ipe.editComponent.propertyPath ) {
                        stop();
                    }
                    ipe.clicked = null;
                };

                var editMockup = {
                    store: store,
                    property: property,
                    propertyPath: propertyPath,
                    initialValue: initialValue,
                    parent: $parent,
                    updateParagraph: function(textPropertyName, editedContent) {
                        if( editedContent && typeof(editedContent) == "string") {
                            editedContent = editedContent.replace(new RegExp("&amp;","g"),"&");
                        }
                        CQ_Analytics.ClientContext.set(this.propertyPath, editedContent);
                    },
                    cancelInplaceEditing: function() {
                        ipe.isCancelled = true;
                        stop();
                    },
                    finishInplaceEditing: function() {
                        stop();
                    },
                    refreshSelf: function() {
                        ipe.editComponent.parent.removeClass("cq-clientcontext-editing");
                    }
                };
                $parent.addClass("cq-clientcontext-editing");
                ipe.start(
                    editMockup,
                    CQ.Ext.get($t[0]),
                    editMockup.initialValue
                );

                $CQ(document).bind("click",handleDocumentClick);
                //$CQ(document).bind("keyup",stop);

                ipe.running = true;
                ipe.clicked = null;

                event.stopPropagation();
            } else {
                if( ipe.editComponent.propertyPath != propertyPath ) {
                    stop();
                } else {
                    ipe.clicked = propertyPath;
                }
            }
        };

        var enableInPlaceEditor = function(store, divId) {
            /* either property id or whole store */
            var parentElement = divId ? $CQ("#" + divId).parent() : (".section." + store.STOREKEY).toLowerCase();

            $CQ("[data-store][data-property]", parentElement)
                .filter(function() {
                    /* skip data-store elements which have children (for example avatar, geolocation map thumbnail, browser thumbnail, etc) */
                    return $CQ(this).children().length === 0;
                })
                .unbind("click", handleInPlaceEdition)
                .bind("click", handleInPlaceEdition);
        };

        var disableInPlaceEditor = function(store, divId) {
            $CQ("[data-store][data-property]", $CQ("#" + divId).parent())
                .unbind("click", handleInPlaceEdition);
        };

        var prepareStore = function(e, sessionstore) {
            /* if store is initialized, but in place editor is not yet */
            if (sessionstore.initialized) {
                enableInPlaceEditor(sessionstore);
            }

            if (!sessionstore.inPlaceEditorListenersAttached) {
                sessionstore.inPlaceEditorListenersAttached = true;

                sessionstore.addListener("initialpropertyrender", function(event, store, divId) {
                    if ($CQ("#" + divId).parents(".cq-cc-content").length > 0) {
                        enableInPlaceEditor(store, divId);
                    }
                });

                sessionstore.addListener("beforerender", function(event, store, divId) {
                    disableInPlaceEditor(store, divId);
                });

                sessionstore.addListener("render", function(event, store, divId) {
                    enableInPlaceEditor(store, divId);
                });
            }
        };

        var prepareAllStores = function() {
            $CQ.each(CQ_Analytics.CCM.getStores() || {}, function(name, store) {
                prepareStore({}, store);
            });
        };

        /* enable in place editing for a given store when it gets registered */
        CQ_Analytics.CCM.addListener('storeregister', prepareStore);

        /* however, if all stores were already registered, attach in place edition manually, as above listener will be never executed again */
        if (CQ_Analytics.CCM.areStoresInitialized) {
            prepareAllStores();
        } else {
            CQ_Analytics.CCM.addListener('storesinitialize', prepareAllStores);
        }
    });
}


/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */
/**
 * @class CQ.personalization.ProfileLoader
 * @extends CQ.Dialog
 * ProfileLoader is a dialog providing functionalities to select, load a profile and update the
 * <code>{@link CQ_Analytics.ProfileDataMgr}</code>.
 * @constructor
 * Creates a new ProfileLoader.
 * @param {Object} config The config object
 */
CQ.personalization.ProfileLoader = CQ.Ext.extend(CQ.Dialog, {
    constructor: function(config) {
        config = (!config ? {} : config);

        var profileCombo = new CQ.Ext.form.ComboBox({
            "fieldLabel": CQ.I18n.getMessage("Select profile"),
            "name": "profile",
            "cls": "cq-eclickstreamcloud",
            "stateful": false,
            "typeAhead":true,
            "triggerAction":"all",
            "inputType":"text",
            "displayField":"name",
            "valueField": "id",
            "emptyText": "",
            "minChars":0,
            "editable":true,
            "lazyInit": false,
            "queryParam": "filter",
            "triggerScrollOffset": 80,
            "listeners": {
                "render": function(comp) {
                    var scroller = $CQ(comp.innerList.dom);

                    if (!scroller) {
                        return;
                    }

                    scroller.on('scroll', function(e) {
                        if (comp.refreshing || comp.loading || (comp.store.getCount() >= comp.store.getTotalCount())) {
                            return;
                        }

                        if ((this.scrollTop > 0) && ((this.scrollTop + this.clientHeight + comp.triggerScrollOffset) >= this.scrollHeight)) {
                            if (!comp.moreStore) {
                                comp.moreStore = new CQ.Ext.data.GroupingStore({
                                    "proxy": new CQ.Ext.data.HttpProxy({
                                        "url": comp.store.proxy.url,
                                        "method": comp.store.proxy.conn.method
                                    }),
                                    "reader": comp.store.reader,
                                    "listeners": {
                                        "load": function() {
                                            if (comp.loadingIndicator) {
                                                comp.loadingIndicator.remove();
                                                comp.loadingIndicator = undefined;
                                            }

                                            for (var i = 0; i < comp.moreStore.getCount(); i++) {
                                                var record = comp.moreStore.getAt(i);
                                                comp.store.add(record);
                                            }

                                            comp.refreshing = false;
                                        }
                                    },
                                    "dataView": this
                                });
                            }

                            var lastParams = comp.store.lastOptions ? comp.store.lastOptions.params : comp.store.baseParams;
                            var moreParams = $CQ.extend({}, lastParams, {
                                'limit': comp.store.baseParams ? comp.store.baseParams.limit : 25,
                                'start': comp.store.getCount()
                            });

                            comp.loadingIndicator = comp.innerList.createChild({'tag': 'div', "cls": "loading-indicator", 'html': CQ.I18n.getMessage("Loading...")});
                            comp.refreshing = true;
                            comp.moreStore.load({
                                "params": moreParams
                            });
                        }
                    });

                }
            },
            "fieldDescription": CQ.I18n.getMessage("Select the profile you want to load."),
            "tpl" :new CQ.Ext.XTemplate(
                '<tpl for=".">',
                '<div class="cq-eclickstreamcloud-list">',
                '<div class="cq-eclickstreamcloud-list-entry">{[values.name==""? values.id: CQ.shared.XSS.getXSSTablePropertyValue(values, "name")]}</div>',
                '</div>',
                '</tpl>'),
            "itemSelector" :"div.cq-eclickstreamcloud-list",
            "store": new CQ.Ext.data.Store({
                "autoLoad":false,
                "proxy": new CQ.Ext.data.HttpProxy({
                    "url": "/bin/security/authorizables.json",
                    "method":"GET"
                }),
                "baseParams": {
                    "start": 0,
                    "limit": 15,
                    "hideGroups": "true"
                },
                "reader": new CQ.Ext.data.JsonReader({
                    "root":"authorizables",
                    "totalProperty":"results",
                    "id":"id",
                    "fields":["name", "name" + CQ.shared.XSS.KEY_SUFFIX,"id", "home"]})
            }),
            "defaultValue": ""
        });

        var currentObj = this;
        var defaults = {
            "height": 170,
            "width": 400,
            "title": CQ.I18n.getMessage("Profile Loader"),
            "items": {
                "xtype": "panel",
                items: [profileCombo]
            },
            "buttons": [
                {
                    "text": CQ.I18n.getMessage("OK"),
                    "handler":function() {
                        var val = profileCombo.getValue();
                        if (!val || val === '') {
                            return;
                        }
                        if (window.CQ_Analytics) {
                            CQ_Analytics.ProfileDataMgr.loadProfile(val);
                            // Refresh Adobe Target info for new user:
                            if (CQ_Analytics.TestTarget && CQ_Analytics.TestTarget.deleteMboxCookies) {
                                CQ_Analytics.TestTarget.deleteMboxCookies();
                            }
                        }
                        currentObj.hide();
                    }
                },
                CQ.Dialog.CANCEL
            ]
        };

        CQ.Util.applyDefaults(config, defaults);

        // init component by calling super constructor
        CQ.personalization.ProfileLoader.superclass.constructor.call(this, config);
    }
});

/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */
/**
 * @class CQ.personalization.OperatorSelection
 * @extends CQ.form.Selection
 * OperatorSelection is a specialized selection allowing to choose one of the
 * <code>{@link CQ_Analytics.Operator CQ_Analytics.Operators}</code>.
 * @constructor
 * Creates a new OperatorSelection.
 * @param {Object} config The config object
 */
CQ.personalization.OperatorSelection = CQ.Ext.extend(CQ.form.Selection, {
    constructor: function(config) {
        config = (!config ? {} : config);

        var defaults = {};

        if (window.CQ_Analytics
            && window.CQ_Analytics.Operator && config.operators) {
            //transform operators config to options.
            config.options = config.options ? config.options : new Array();
            config.operators = config.operators instanceof Array ? config.operators : [config.operators];
            for (var i = 0; i < config.operators.length; i++) {
                if (config.operators[i].indexOf("CQ_Analytics.Operator." == 0)) {
                    try {
                        config.operators[i] = eval("config.operators[i] = " + config.operators[i] + ";");
                    } catch(e) {
                    }
                }
                var value = config.operators[i];
                if ( value ) {
                    var text = CQ_Analytics.OperatorActions.getText(config.operators[i]);
                    text = text ? text : value;
                    config.options.push({
                        "text": CQ.I18n.getVarMessage(text),
                        "value": value
                    });
                }
            }
        }

        CQ.Util.applyDefaults(config, defaults);

        // init component by calling super constructor
        CQ.personalization.OperatorSelection.superclass.constructor.call(this, config);
    }
});

CQ.Ext.reg("operatorselection", CQ.personalization.OperatorSelection);
/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */
//initialization of all the analytics objects available in edit mode
CQ.Ext.onReady(function() {
    //link clickstreamcloud editor to clickstreamcloud ui box
    if (window.CQ_Analytics
        && window.CQ_Analytics.ClickstreamcloudUI) {
        CQ_Analytics.ClickstreamcloudUI.addListener("editclick", function() {

            if( !CQ_Analytics.ClickstreamcloudEditor ) {
                //clickstreamcloud editor itself
                CQ_Analytics.ClickstreamcloudEditor = new CQ.personalization.EditableClickstreamcloud();

                //registers the session stores
                var reg = function(mgr) {
                    if (mgr) {
                        var config = CQ_Analytics.ClickstreamcloudMgr.getEditConfig(mgr.getSessionStore().getName());
                        config["sessionStore"] = mgr.getSessionStore();
                        CQ_Analytics.ClickstreamcloudEditor.register(config);
                    }
                };

                //profile data
                reg.call(this, CQ_Analytics.ProfileDataMgr);

                //page data
                reg.call(this, CQ_Analytics.PageDataMgr);

                //tagcloud data
                reg.call(this, CQ_Analytics.TagCloudMgr);

                //surfer info data
                reg.call(this, CQ_Analytics.SurferInfoMgr);
                
                //eventinfodata
                reg.call(this, CQ_Analytics.EventDataMgr);
            }
            CQ_Analytics.ClickstreamcloudEditor.show();
        });

        CQ_Analytics.ClickstreamcloudUI.addListener("loadclick", function() {
            var dlg = new CQ.personalization.ProfileLoader({});
            dlg.show();
        });
    }
});
/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

// initialize CQ.personalization package
CQ.personalization.variables = {};

/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

CQ.personalization.variables.Variables = {};

CQ.personalization.variables.Variables.SCANNED_TAGS = ["*"];

CQ.personalization.variables.Variables._storeToInitialize = CQ_Analytics.ProfileDataMgr;

CQ.personalization.variables.Variables.applyToEditComponent = function(path) {

    CQ.Ext.onReady(function() {
        //TODO configurable prefix and suffix

        var store = CQ.personalization.variables.Variables._storeToInitialize;

        CQ.WCM.onEditableBeforeRender(path, function(config) {
            var element = config.element;
            if( element ) {
                CQ.personalization.variables.Variables.injectSpans(element, CQ.personalization.variables.Variables.SCANNED_TAGS, "cq-variable-code");
                if (CQ_Analytics && store) {
                    CQ.personalization.variables.Variables.updateVariables(element, store.getData());
                    store.addListener("update", function() {
                        CQ.personalization.variables.Variables.updateVariables(element, store.getData());
                    });
                }
            }
        });

        CQ.WCM.onEditableReady(path, function() {
            this.on(CQ.wcm.EditBase.EVENT_AFTER_EDIT,function() {
                CQ.personalization.variables.Variables.injectSpans(this.element, CQ.personalization.variables.Variables.SCANNED_TAGS, "cq-variable-code");
                CQ.personalization.variables.Variables.updateVariables(this.element, store.getData());
            });
        });
    });
};

CQ.personalization.variables.Variables.injectSpans = function(element, tags, className) {
    element = CQ.Ext.get(element);
    if( element ) {
        className = className || "";
        for (var t = 0; t < tags.length; t++) {
            var reg = new RegExp("\\\$\\{[\\w]*\\}", "ig");
            var pars = CQ.Ext.DomQuery.jsSelect(tags[t] + ":contains(\${)", element.dom);
            for( var i=0;i<pars.length;i++) {
                var p = pars[i];
                //check if matches ...\${}...
                var text = p.innerHTML;
                if (text) {
                    var variables = text.match(reg);
                    var performedVariables = [];
                    for(var j = 0; j < variables.length; j++) {
                        var v = variables[j];
                        if( performedVariables.indexOf(v) == -1) {
                            //vName is variable name (no "\${" and "}")
                            var vName = v.replace(new RegExp("\\\$\\{([\\w]*)\\}", "ig"),"$1");
                            var repl = "<span class=\"cq-variable " + className + " cq-variable-vars-"+vName+"\" title=\""+v+"\">"+v+"</span>";
                            text = text.replace(new RegExp("\\\$\\{"+vName+"\\}", "ig"),repl);
                            performedVariables.push(v);
                        }
                    }
                    p.innerHTML = text;
                }
            }
        }
    }
};

CQ.personalization.variables.Variables.updateVariables = function(element, data) {
    element = CQ.Ext.get(element);
    if( element ) {
        var pars = CQ.Ext.DomQuery.jsSelect("span.cq-variable", element.dom);
        data = data || {};

        for( var i=0;i<pars.length;i++) {
            var p = pars[i];
            var className = p ? p.className : "";
            var reg = new RegExp(".+cq-variable-vars-(\\w+)\\s*(\\w*)", "ig");
            var variable = className.replace(reg, "$1");
            if(variable) {
                var text = p.innerHTML;
                if( text && text != "" && text != " ") {
                    var value = data[variable];
                    value = value && value != "" ? value : "\${"+variable+"}";
                    p.innerHTML = value;
                }
            } else {
                p.innerHTML = "";
            }
        }
    }
};

/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/**
 * @class CQ.form.rte.plugins.InsertVariablePlugin
 * @extends CQ.form.rte.plugins.Plugin
 * <p>This class implements styling text fragments with a CSS class (using "span" tags) as a
 * plugin.</p>
 * <p>The plugin ID is "<b>variables</b>".</p>
 * <p><b>Features</b></p>
 * <ul>
 *   <li><b>variables</b> - adds a style selector (variables will be applied on selection scope)
 *     </li>
 * </ul>
 * <p><b>Additional config requirements</b></p>
 * <p>The following plugin-specific settings must be configured through the corresponding
 * {@link CQ.form.rte.EditorKernel} instance:</p>
 * <ul>
 *   <li>The variablesheets to be used must be provided through
 *     {@link CQ.form.RichText#externalStyleSheets}.</li>
 * </ul>
 */
CQ.form.rte.plugins.InsertVariablePlugin = CQ.Ext.extend(CQ.form.rte.plugins.Plugin, {

    /**
     * @cfg {Object/Object[]} variables
     * <p>Defines CSS classes that are available to the user for formatting text fragments
     * (defaults to { }). There are two ways of specifying the CSS classes:</p>
     * <ol>
     *   <li>Providing variables as an Object: Use the CSS class name as property name.
     *   Specify the text that should appear in the style selector as property value
     *   (String).</li>
     *   <li>Providing variables as an Object[]: Each element has to provide "cssName" (the
     *   CSS class name) and "text" (the text that appears in the style selector)
     *   properties.</li>
     * </ol>
     * <p>Styling is applied by adding "span" elements with corresponding "class"
     * attributes appropriately.</p>
     * @since 5.3
     */

    /**
     * @private
     */
    cachedVariables: null,

    /**
     * @private
     */
    variablesUI: null,

    constructor: function(editorKernel) {
        CQ.form.rte.plugins.InsertVariablePlugin.superclass.constructor.call(this, editorKernel);
    },

    getFeatures: function() {
        return [ "variables" ];
    },

    getVariables: function() {
        var com = CQ.form.rte.Common;
        if (!this.cachedVariables) {
            this.cachedVariables = this.config.variables || { };
            com.removeJcrData(this.cachedVariables);
        }
        return this.cachedVariables;
    },

    initializeUI: function(tbGenerator) {
        var plg = CQ.form.rte.plugins;
        var ui = CQ.form.rte.ui;
        if (this.isFeatureEnabled("insertvariable")) {
            this.variablesUI = new ui.TbVariableSelector("insertvariable", this, null, this.getVariables());
            tbGenerator.addElement("insertvariable", plg.Plugin.SORT_STYLES, this.variablesUI, 10);
        }
    },

    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        CQ.Util.applyDefaults(pluginConfig, {
            "variables": {
                // empty default value
            }
        });
        this.config = pluginConfig;
    },

    execute: function(cmdId) {
        if (!this.variablesUI) {
            return;
        }
        var cmd = null;
        var value = null;
        switch (cmdId.toLowerCase()) {
            case "insertvariable_insert":
                cmd = "inserthtml";
                value = this.variablesUI.getSelectedVariable();
                break;
        }
        if (cmd && value) {
            var vt = "${"+value+"}";
            //var html = "<span class=\"cq-variable cq-variable-code cq-variable-vars-"+value+"\" title=\""+vt+"\">"+vt+"</span>&nbsp;";
            this.editorKernel.relayCmd(cmd, vt);
        }
    }
});

// register plugin
CQ.form.rte.plugins.PluginRegistry.register("insertvariable", CQ.form.rte.plugins.InsertVariablePlugin);
/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/**
 * @class CQ.form.rte.ui.TbVariableSelector
 * @extends CQ.form.rte.ui.TbElement
 * @private
 * This class represents a variable selecting element for use in
 * {@link CQ.form.rte.ui.ToolbarBuilder}.
 */
CQ.form.rte.ui.TbVariableSelector = CQ.Ext.extend(CQ.form.rte.ui.TbElement, {

    variableSelector: null,

    variables: null,

    toolbar: null,

    constructor: function(id, plugin, tooltip, variables) {
        CQ.form.rte.ui.TbVariableSelector.superclass.constructor.call(this, id, plugin, false,
                tooltip);
        this.variables = variables;
    },

    /**
     * Creates HTML code for rendering the options of the variable selector.
     * @return {String} HTML code containing the options of the variable selector
     * @private
     */
    createStyleOptions: function() {
        var htmlCode = "";
        if (this.variables) {
            for (var v in this.variables) {
                if (this.variables.hasOwnProperty(v)) {
                    var variableToAdd = this.variables[v];
                    htmlCode += "<option value=\"" + variableToAdd.value + "\">" + CQ.I18n.getVarMessage(variableToAdd.text) + "</option>";
                }
            }
        }
        return htmlCode;
    },

    getToolbar: function() {
        return CQ.form.rte.ui.ToolbarBuilder.STYLE_TOOLBAR;
    },

    addToToolbar: function(toolbar) {
        this.toolbar = toolbar;
        if (CQ.Ext.isIE) {
            // the regular way doesn't work for IE anymore with Ext 3.1.1, hence working
            // around
            var helperDom = document.createElement("span");
            helperDom.innerHTML = "<select class=\"x-font-select\">"
                    + this.createStyleOptions() + "</span>";
            this.variableSelector = CQ.Ext.get(helperDom.childNodes[0]);
        } else {
            this.variableSelector = CQ.Ext.get(CQ.Ext.DomHelper.createDom({
                tag: "select",
                cls: "x-font-select",
                html: this.createStyleOptions()
            }));
        }
        this.variableSelector.on('focus', function() {
            this.plugin.editorKernel.isTemporaryBlur = true;
        }, this);
        // fix for a Firefox problem that adjusts the combobox' height to the height
        // of the largest entry
        this.variableSelector.setHeight(19);
        var addButton = {
            "itemId": this.id + "_insert",
            "iconCls": "x-edit-insertvariable",
            "text": CQ.I18n.getMessage("Insert"),
            "enableToggle": (this.toggle !== false),
            "scope": this,
            "handler": function() {
                this.plugin.execute(this.id + "_insert");
            },
            "clickEvent": "mousedown",
            "tabIndex": -1
        };
        toolbar.add(
            CQ.I18n.getMessage("Variable"),
            " ",
            this.variableSelector.dom,
            addButton
        );
    },

    createToolbarDef: function() {
        // todo support usage in global toolbar
        return null;
    },

    getSelectedVariable: function() {
        var variable = this.variableSelector.dom.value;
        if (variable.length > 0) {
            return variable;
        }
        return null;
    },

    getExtUI: function() {
        return this.variableSelector;
    },

    getInsertButtonUI: function() {
        return this.toolbar.items.map[this.id + "_insert"];
    }

});
/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

// Authoring UI for targeting

// internal scope
(function() {

    function _debug(msg) {
        if ((window.location.href.indexOf("?debugTargetEditor") > -1)
                || window.location.href.indexOf("&debugTargetEditor") > -1) {
            msg = this.component.path.substring(this.component.path.lastIndexOf("/") + 1, this.component.path.length) + " " + msg;
            console.log(msg);
        }
    }

    // Utility to traverse an object tree and call a function (key, obj, parent) for every object.
    function traverse(obj, fn, key, parent) {
        if (typeof obj === "object") {
            if (fn.apply(this, [key, obj, parent])) {
                return true;
            }
            var stop = false;
            $CQ.each(obj, function(k, v) {
                if (traverse(v, fn, k, obj)) {
                    stop = true;
                    return true;
                }
            });
            if (stop) {
                return true;
            }
        }
        return false;
    }

    /** if a string starts with a certain prefix */
    function startsWith(str, prefix) {
        return (str.indexOf(prefix) === 0);
    }

    /** returns the last name in a path; eg. /content/foo/bar => bar */
    function basename(path) {
        return path.substring(path.lastIndexOf("/") + 1);
    }

    function createPage(path, resourceType, params, successFn, scope, failureFn) {
        var defaultParams = {};
        defaultParams["jcr:primaryType"] = "cq:Page";
        defaultParams["jcr:content/jcr:primaryType"] = "cq:PageContent";
        defaultParams["jcr:content/sling:resourceType"] = resourceType;

        params = CQ.utils.Util.applyDefaults(params, defaultParams);

        CQ.HTTP.post(path, function(options, success, xhr, response) {
            if (success) {
                if (successFn) {
                    successFn.call(scope, response);
                }
            }  else {
                if (failureFn) {
                    failureFn.call(scope, response);
                }
            }
        }, params);
    }

    // path inside an offer page that contains the actual offer/teaser component(s)
    var OFFER_INNER_PATH = "jcr:content/par";
    var DEFAULT_COMPONENT = "default";

    // the placeholder image for experiences that don't have an offer yet.
    var OFFER_PLACEHOLDER = "/libs/cq/ui/widgets/themes/default/icons/240x180/page.png";

    // client context properties
    var CAMPAIGN_PROP = "campaign/path";
    var EXPERIENCE_PROP = "campaign/recipe/path";
    var LOCATION_NAME_PARAM = "location";
    var COMMAND_SERVLET = "/bin/wcmcommand",
        CMD_DELETE_OP = "deletePage";

    var createOfferInProgress = false;

    /**
     * Authoring UI for targeting.
     *
     * @constructor
     * @param {CQ.wcm.EditBase} component EditBase instance of target component
     */
    CQ.personalization.TargetEditor = function(component) {

        this._reloadInProgress = false;

        this.component = component;
        // initially, the target component renders the default experience included
        // TODO: make this dependent on rendering engine (t+t=> default present, cq teaser=> not)
        this.activeExperience = null; //CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE;

        // the location of this mbox
        // it will be assigned a few lines down
        this.mboxLocation = null;

        //The index of the active experience. Used to scroll the carousel to this position.
        //Easier to remember once than to look it up every time.
        this.activeExperienceIndex = 0;

        // get updated by campaign reselection
        var campaignStore = ClientContext.get("campaign");
        if (campaignStore) {
            campaignStore.addListener("update", this.onCampaignUpdate, this);
        }

        // read the mbox location from the repository
        if (component.params["./sling:resourceType"] === "cq/personalization/components/target") {
            var that = this;
            var url = component.path + ".json";
            $CQ.ajax(url).done(function(editableData){
                if (editableData[LOCATION_NAME_PARAM] && (editableData[LOCATION_NAME_PARAM] !== "")) {
                    that.mboxLocation = editableData[LOCATION_NAME_PARAM];
                } else {
                    that.mboxLocation = component.path;
                }
            });
        }

        // need to hook into nested editables when we switch the teaser content
        CQ.WCM.on("editableready", this.onEditableReady, this);

        // need to listen for "mode change" events (i.e. in case of switching to preview mode)
        CQ.WCM.getTopWindow().CQ.WCM.on("wcmmodechange", this.onWCMModeChange, this);

        this.render();

        // update default content if the ClientContext already has a selection, but after the component
        // is rendered since we potentially change the DOM
        if ( campaignStore && ClientContext.get(CAMPAIGN_PROP) ) {
            this.update();
        }

        this.renderOverlayIcon();

        var targetEditor = this;

        // hook into observation to make sure the popup stays positioned at the right place
        var observeElementPosition = component.observeElementPosition;
        component.observeElementPosition = function() {
            targetEditor.position();
            observeElementPosition.call(this);
            // we should also reposition the placeholder in case we don't have an offer.
            if (!component.deleted) {
                if (!targetEditor.getOfferURL(targetEditor.activeExperience)
                    && !targetEditor.offersBackup[targetEditor.activeExperience]) {
                    targetEditor.createMissingOfferPlaceholder();
                } else {
                    targetEditor.missingOfferPlaceholder.hide();
                    component.resumeDropTargets();
                }
            }
        };

        // remove the target editor UI if the editable component is removed
        var remove = component.remove;
        component.remove = function() {
            targetEditor.remove();
            delete component.targetEditor;
            remove.call(this);
        };
    };

    CQ.personalization.TargetEditor.prototype = {

        // private: listener for campaign store changes
        onCampaignUpdate: function(event, property) {
            _debug.call(this, "Campaign updated detected");
            // if no property is given, this event means that everything needs to reload
            var reload = (typeof property === "undefined");
            this.update(reload);
        },

        // private: track all nested components (that are part of the targeting)
        onEditableReady: function(editable) {
            var compName = this.component.path.substring(this.component.path.lastIndexOf("/"), this.component.path.length);

            // check if this is the same editable as the component we are tracking
            if (!editable
                || !editable.getTargetAncestor()
                || (editable.path.indexOf(compName) === -1)) {
                return;
            }
            // if the placeholder is defined we must hide it first.
            if (this.missingOfferPlaceholder) {
                this.missingOfferPlaceholder.hide();
            }

            var offer;
            // get base path to current offer to check against editable path
            if (this.activeExperience === CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE || !this.activeExperience) {
                offer = this.component.path + "/" + DEFAULT_COMPONENT;
            } else {
                offer = this.offers[this.activeExperience];
                if (!offer) {
                    editable.suspendDropTargets();
                    this.createMissingOfferPlaceholder();
                } else {
                    // reactivate the drop targets, since they might be suspended if we didn't have an offer before
                    editable.resumeDropTargets();
                }
                offer = offer + "/" + OFFER_INNER_PATH;
            }

            // we are only interested in components from the offer page we load
            if (startsWith(editable.path, offer)) {
                this.trackNestedEditable(editable);
            }
        },

        /*
         * Intercept mode changes.
         * If there's anything special we need to do when switching modes (edit, preview, design etc.) this is the place.
         */
        onWCMModeChange: function(mode) {
            if (mode === CQ.utils.WCM.MODE_PREVIEW) {
               // switching to preview mode, need to hide the experiences window.
               this.hide();
            }
        },

        // update preview images when current active offer component is edited
        // therefore listen to afteredit event for all our nested components
        trackNestedEditable: function(editable) {
            // get notified after all edit operations
            editable.on(CQ.wcm.EditBase.EVENT_AFTER_EDIT, function() {
                // update preview images (update entire view as we don't necessarily know what changed
                // in the component, for smooth loading & proper image scaling)
                this.reloadExperiencesInPopup(true);
            }, this);

            var targetEditor = this;

            // disable drag and drop for the nested editable, because it breaks the page content
            // see issue CQ5-30220
            editable.orderable = false;
            if (editable instanceof CQ.wcm.EditBar) {
                // EditBars only honor "orderable" when they are first rendered,
                // so we have to hack them into become unmovable when targeted
                editable.dd = CQ.wcm.EditBar.DisabledDragZone.getInstance(editable.el);
            }

            if (editable instanceof CQ.wcm.EditRollover) {
                editable.on(CQ.wcm.EditRollover.EVENT_SHOW_HIGHTLIGHT, function(component) {
                    targetEditor.showOverlayIcon();
                });
                editable.on(CQ.wcm.EditRollover.EVENT_HIDE_HIGHTLIGHT, function(component) {
                    targetEditor.hideOverlayIcon();
                });
            } else {
                var el = $CQ(editable.element.dom);
                el.mouseover(function(event) {
                    targetEditor.showOverlayIcon();
                });
                el.mouseout(function(event) {
                    // keep visible if the mouse goes over the overlay icon
                    if (!targetEditor.overlayIcon.is(event.relatedTarget)) {
                        targetEditor.hideOverlayIcon();
                    }
                });
            }
        },

        // if we don't have an offer for the current experience we have to show a placeholder
        createMissingOfferPlaceholder: function() {
            //determine where should we "anchor" this overlay
            var anchor = $CQ(this.component.element.dom);
            var that = this;

            //pre-determine the position.
            var cssPosition = {
                left:  anchor.offset().left + "px",
                top:   anchor.offset().top  + "px",
                width: anchor.width()       + "px",
                height:anchor.height()      + "px"
            };

            if (this.missingOfferPlaceholder) {
                // if we already have a placeholder let's show it now
                this.missingOfferPlaceholder.show();

                // apply the position values again, because the anchor may have been repositioned (e.g. via browser resize).
                this.missingOfferPlaceholder.css(cssPosition);
                return;
            }

            // create the placeholder div initially
            this.missingOfferPlaceholder = $CQ("<div>")
                .addClass("cq-targeting-offer-placeholder")
                .css(cssPosition)
                .mouseover(function(e){
                    that.showOverlayIcon();
                })
                .mouseout(function(e){
                    if (!that.overlayIcon.is(e.relatedTarget)) {
                        that.hideOverlayIcon();
                    }
                })
               .appendTo("#"+CQ.Util.ROOT_ID);

            //add a clickable text so the user can easily add content to the experience
            $CQ("<span>")
                .addClass("cq-editrollover-insert-message")
                .html(CQ.I18n.getMessage("Add offer"))
                .click(function(e) {
                    // it will create the default offer.
                    that.createOffer(that.activeExperience, function(){
                        // need to load them locally again to show updated image
                        that.reloadExperiencesInPopup(true);
                    });
                    return false;
                })
                .appendTo(this.missingOfferPlaceholder);
        },

        /**
         * Updates the selection from the ClientContext campaign store.
         *
         * Called when the the campaign or experience has been changed anywhere, including
         * when an experience was selected in our popup. It all goes via the ClientContext
         * campaign store.
         */
        update: function(reload) {
            _debug.call(this, "Reloading after ClientContext update...");
            var campaign = ClientContext.get(CAMPAIGN_PROP);
            
            // make sure to update the select2 widget and not the backing select native widget
            this.campaignSelector.select2("val", campaign);

            if (!reload) {
                // only reload experiences list if campaign changed
                if (campaign !== this.campaign) {
                    this.campaign = campaign;
                    reload = true;
                }
            }

            var experience = ClientContext.get(EXPERIENCE_PROP);
            _debug.call(this, "Experience set by CC is " + experience);
            // safety check: if campaign is selected, but experience is empty,
            // interpret as DEFAULT experience selected
            if (campaign && !experience) {
                experience = CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE;
            }
            
            // quick validation (should be in CampaignMgr?)
            if (experience && experience.indexOf("/") === 0) {
                // if experience is not part of current campaign, stop
                if (!startsWith(experience, this.campaign + "/")) {
                    return;
                }
            }

            this.reloadExperiencesInPopup(reload, function() {
                this.switchExperience(experience);
            });
        },
        
        /**
         * Updates the error indicator in the toolbar based on the synchronization information 
         * retrieved from the ClientContext
         * 
         * @param {Object} campaign
         */
        updateSyncError: function(campaign) {
            
            var lastSyncError = campaign ? campaign["lastSyncError"] : null;
            
            var errorDiv = this.el.find('.cq-targeting-action-error')
            if ( lastSyncError ) {
                errorDiv.attr('title', CQ.I18n.get("The campaign was not succesfully synchronized to Adobe Target: {0}", lastSyncError)).fadeIn();
            } else {
                errorDiv.removeAttr('title').fadeOut();
            }
        },

        /**
         * Load new offer in our inner html.
         *
         * Replace the inner html of the target component with the complete parsys of the offer page
         * (this will automatically instantiate components inside, as the necessary script code will
         * be part of the html returned).
         *
         * Note that we have to refresh on the parent component path, in order to get the html
         * snippet that actually includes the important CQ.WCM.edit() calls.
         *
         * @param {String} experience    the path of the experience we are switching to
         * @param {Boolean} forceRefresh force reload of the inner editable after switching.
         *                               This is necessary when adding experience content.
         *
         */
        switchExperience: function(experience, forceRefresh) {
            _debug.call(this, "Switching to experience " + experience);
            // leaving experience editing and going to simulation (= no campaign set)
            if (!this.campaign) {
                _debug.call(this, "No campaign set, so we're probably in simulation mode");
                // only update if we aren't in simulation already
                // important, client context reset events trigger lots of repated events
                if (this.activeExperience != null) {
                    this.activeExperience = null;

                    // hide placeholder if it is currently shown
                    if (this.missingOfferPlaceholder) {
                        this.missingOfferPlaceholder.hide();
                    }

                    // reload the full component so the engine implementation is reincluded and starts from
                    // scratch (includes e.g. mboxDefault div and mbox script, or cq teaser loading code)
                    // Note: this will NOT include the editcontext for the target component itself, i.e.
                    //       it will not do a CQ.WCM.edit() and reload another TargetEditor
                    var componentUrl = this.component.path + ".html";

                    // Add current page selectors to have the same effect of this ajax as if the page
                    // was rendered. This is needed for mobile teasers (see CQ5-32760)
                    // NOTE: WTF-7 - URLs must be built on the server side, and we get a "refreshURL" or "simulationURL"
                    componentUrl = CQ.shared.HTTP.addSelectors(componentUrl, CQ.shared.HTTP.getSelectors(window.location.href));
                    _debug.call(this,"Refreshing component");
                    this.component.refresh(componentUrl, /*smoothly?*/true);
                }
                return;
            }

            // avoid reloading of offer that's currently shown
            // unless this is called after adding an offer to the current experience.
            if ((experience !== this.activeExperience) || (forceRefresh)) {
                _debug.call(this, "Reloading offer for experience " + experience);
                var oldExperience = this.activeExperience;
                var url = this.getOfferURL(experience);
                if (!url) {
                    // if there is no offer (yet), show the default content behind the missingOfferPlaceholder
                    url = this.component.path + ".default.html";
                }
                this.activeExperience = experience;

                // make sure the cq teaser engine (if running) disables itself for this target component
                // Note: this is engine specific; ideally this should be some generic concept
                _debug.call(this, "Stopping teaser loader");
                CQ_Analytics.Engine.stopTeaserLoader(this.component);

                // defer slightly to avoid issues with the refresh() method when this
                // function is called while this.component is still loading initially
                // Increase the deffered time - very hacky fix for CQ-744 because the S7 "DHTML flyout zoom" component takes more to render.
                _debug.call(this, "Refreshing component with content from " + url);
                 this.component.refresh.defer(200 /* 15 */, this.component, [url, /*smoothly?*/true]);

                // mark selected experience
                ClientContext.set(EXPERIENCE_PROP, experience);
                this.carousel.find('> li').removeClass('cq-targeting-experience-selected');
                this.carousel.find('li[data-cq-experience="' + experience + '"]').addClass("cq-targeting-experience-selected");
            }
            _debug.call(this,"Experience switched to " + experience);
        },

        getOfferURL: function(experience) {
            _debug.call(this, "Get offers URL for " + experience);
            if (experience === CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE || !experience) {
                _debug.call(this, "Offer url is... the default");
                return this.component.path + ".default.html";
            }
            var offer = this.offers[experience];
            if (offer) {
                _debug.call(this, "Offer url is " +offer + "/" + OFFER_INNER_PATH + ".html");
                return offer + "/" + OFFER_INNER_PATH + ".html";
            }
            _debug.call(this, "No offer found in the internal cache");
            return null;
        },

        /** create experience for the given segment */
        // TODO: merge with create offer in single request
        createExperience: function(name, title, segment) {
            var params = {};
            params[":nameHint"] = name;
            params["jcr:content/jcr:title"] = title;
            params["jcr:content/cq:segments"] = segment;
            params["jcr:content/cq:segments@TypeHint"] = "String[]";
            params["jcr:content/cq:template"] = "/libs/cq/personalization/templates/experience";

            createPage(
                this.campaign + "/*",
                "cq/personalization/components/experiencepage",
                params,
                function(response) {
                    var experience = response.headers[CQ.HTTP.HEADER_PATH];
                    this.createOffer(experience, function() {
                        // reload (because experience is new) and select globally
                        var campaignStore = ClientContext.get('campaign');
                        if (campaignStore) {
                            campaignStore.reload(experience);
                        }
                    });
                },
                this
            );
        },

        /** create an offer under the given experience based on the current component */
        createOffer: function(experience, callback) {
            if (createOfferInProgress) {
                return;
            }
            createOfferInProgress = true;
            this.offers[experience] = "pending";
            if (this.missingOfferPlaceholder) {
                this.missingOfferPlaceholder.hide();
            }

            var params = {};

            // support custom location:
            params["jcr:content/location"] = this.mboxLocation;
            params["parResourceType"] = "foundation/components/parsys";
            params["experiencePath"] = experience;
            params["jcr:content/sling:resourceType"] = "cq/personalization/components/teaserpage";

            var that = this;
            CQ.HTTP.post(this.component.path + ".createoffer.json", function(options, success, xhr, response) {
                if (success) {
                    var responseJson = $CQ.parseJSON(xhr.responseText);
                    that.offers[experience] = responseJson["offerPath"];
                    that.switchExperience(experience, true);
                    callback.call(that);
                    createOfferInProgress = false;
                } else {
                    that.offers[experience] = undefined;
                    if (typeof CQ != "undefined"
                        && CQ.Notification) {
                        CQ.Notification.notify(CQ.I18n.getMessage("Failure"),CQ.I18n.getMessage("Could not create offer!"));
                    }
                }
            }, params, that, true);
        },

        /** Removes the offer for the specified experience */
        removeOffer:function(experience, callback) {
            var scope = this,
                path = this.offers[experience],
                params = {};

            params["path"] = path;
            params["cmd"] = CMD_DELETE_OP;

            CQ.HTTP.post(COMMAND_SERVLET, function(options, success, xhr, response) {
                if (success) {
                    if (callback) {
                        callback.call(scope, response);
                    }
                }
            }, params);
        },

        deleteExperience: function(path) {
            if ( !path ) {
                return;
            }

            var params = {
                "cmd":CMD_DELETE_OP,
                "path":path
            };

            $CQ.post(COMMAND_SERVLET, params, function() {
                // reload (because experience is new) and select globally
                var campaignStore = ClientContext.get('campaign');
                if (campaignStore) {
                    campaignStore.reload(CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE);
                }
            });
        },

        renderOverlayIcon: function() {
            var targetEditor = this;
            this.overlayIcon = $CQ("<div>")
                .addClass("cq-targeting-launch-icon cq-targeting-icon-placeholder")
                .attr("title", CQ.I18n.get("Experiences..."))
                .click(function() {
                    targetEditor.toggle();
                })
                .mouseover(function(event) {
                    targetEditor.showOverlayIcon();
                })
                .mouseout(function(event) {
                    var el = $CQ(targetEditor.component.element.dom);
                    // keep visible if the mouse goes over the element
                    if (!targetEditor.el.is(event.relatedTarget)) {
                        targetEditor.hideOverlayIcon();
                    }
                })
                .appendTo($CQ("#" + CQ.Util.ROOT_ID))
                .hide();

            this.positionOverlayIcon();
        },

        /** initially renders the basic editor popup container */
        render: function() {
            if (this.el) {
               return;
            }

            var that = this;

            // main element
            this.el = $CQ("<div>").addClass("cq-targeting-editor");

            // toolbar on top
            var toolbar = $CQ("<div>")
                .addClass("cq-targeting-editor-toolbar")
                .appendTo(this.el);
            $CQ("<div>")
                .addClass("cq-targeting-action cq-targeting-action-edit")
                .attr("title", CQ.I18n.getMessage("Edit targeting settings"))
                .appendTo(toolbar)
                .click(function() {
                    CQ.wcm.EditBase.showDialog(that.component, CQ.wcm.EditBase.EDIT);
                    return false;
                });
            this.addEl = $CQ("<div>")
                .addClass("cq-targeting-action cq-targeting-action-add")
                .attr("title", CQ.I18n.getMessage("Add new experience"))
                .appendTo(toolbar)
                .click(function() {
                    that.addExperience();
                    return false;

                });
            
            $CQ("<div>")
                .addClass("cq-targeting-action cq-targeting-action-error")
                .text("!")
                .css("display", "none")
                .appendTo(toolbar);
            
            var holder = $CQ("<div>")
                .addClass("cq-targeting-campaign-selector")
                .appendTo(toolbar);
            
            var campaignMgr = ClientContext.get("campaign");
            var campaigns = CQ_Analytics.CampaignMgr.data.campaigns || [];
            var selectedCampaign = ClientContext.get(CAMPAIGN_PROP);
            var i;

            var container = $CQ("<div>").addClass("cq-cc-store").appendTo(holder);
            var selectorContainer = $CQ("<div>").addClass("cq-cc-campaign-prop").appendTo(container);

            this.campaignSelector = $CQ("<select>").change(function() {
                var selected = $CQ(this).find(":selected");
                if ( selected.length ) {
                    ClientContext.set(CAMPAIGN_PROP,selected[0].value);
                }
            }).appendTo(selectorContainer);

            $CQ("<option>").attr({"value":"", "label": CQ.I18n.getMessage("(simulation)")}).html(CQ.I18n.getMessage("(simulation)")).appendTo(this.campaignSelector);
            for (i = 0; i < campaigns.length; i++) {
                $CQ("<option>")
                    .attr({"value":campaigns[i].path,"label":campaigns[i].title})
                    .html(campaigns[i].title)
                    .appendTo(this.campaignSelector);
            }
            
            if ( selectedCampaign ) {
                this.campaignSelector.val(selectedCampaign);
            }
            
            this.campaignSelector.select2({
                'width': '180px',
                'dropdownCssClass': 'cq-cc-campaign-store-dropdown'
            });
            
            
            $CQ("<div>")
                .addClass("cq-targeting-action cq-targeting-action-close")
                .attr("title", CQ.I18n.getMessage("Close the experience switcher"))
                .appendTo(toolbar)
                .click(function() {
                    that.hide();
                    return false;
                });

            this.contentDiv = $CQ("<div>").addClass("cq-targeting-editor-content").appendTo(this.el);

            // attach to #CQ authoring div
            $CQ("#" + CQ.Util.ROOT_ID).append(this.el);

            // make sure it's not visible at start
            this.el.hide();
        },

        /** build HTML for a single experience list item */
        createExperienceItem: function(thumbnail, experience, label) {
            var that = this;

            // build item to show this experience/offer with image & text
            var item = $CQ("<li>")
                .attr("data-cq-experience", experience)
                .attr("title", CQ.I18n.getMessage("Switch to experience: {0}", label))
                .click(function() {
                    ClientContext.set(EXPERIENCE_PROP, $CQ(this).attr("data-cq-experience"));
                    return false;
                })
                .addClass("jcarousel-item");

            var itemContent = $CQ("<div>")
                .addClass("cq-targeting-experience-content")
                .appendTo(item);

            thumbnail = CQ.shared.HTTP.externalize(thumbnail);

            var thumbWrap = $CQ("<div>")
                .addClass("cq-targeting-experience-img-clip")
                .appendTo(itemContent);
            var thumb = $CQ("<img>")
                .attr("src", thumbnail)
                .addClass("cq-targeting-experience-img")
                .hide()
                .appendTo(thumbWrap);

            // if there's no thumbnail then don't do anything.
            if (thumbnail !== "") {
                CQ_Analytics.onImageLoad(thumbnail, function(img) {
                    // keep target image size in sync with @imgWidth and @imgHeight in target.less
                    var w = img.width;
                    var h = img.height;
                    if (img.width == 0) {
                        // this means the image is missing so we need to
                        // replace it with the placeholder.
                        // this usually happens when the targeted component is not an image.
                        thumb.attr("src",OFFER_PLACEHOLDER);
                        // ugly, hardcode the values
                        w = 240;
                        h = 180;
                    }
                    var scaled = CQ_Analytics.scaleImage(w, h, 140, 100);
                    thumb.width(scaled.width);
                    thumb.height(scaled.height);
                    thumb.css("top", scaled.top);
                    thumb.css("left", scaled.left);
                    thumb.fadeIn();
                });
            }
            $CQ("<div>")
                .addClass("cq-targeting-experience-label")
                .text(label)
                .appendTo(itemContent);

            if (experience !== CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE) {

                var quickActions = $CQ("<div>")
                    .addClass("cq-targeting-experience-quickactions")
                    .appendTo(itemContent);

                // if we don't have an offer for this experience then show the "add" button
                if (!this.offers[experience]) {
                    // show the add button
                    $CQ("<div>")
                        .addClass("cq-targeting-experience-quickactions-add")
                        .attr("title", CQ.I18n.getMessage("Add experience content"))
                        .click(function(e) {
                            that.createOffer($CQ(this).parents("li").attr("data-cq-experience"), function(){
                                // need to load them locally again to show updated image
                                that.reloadExperiencesInPopup(true);
                            });
                            return false;
                        })
                        .appendTo(quickActions);
                    // show the DELETE EXPERIENCE button if we don't have an offer.
                    $CQ("<div>")
                        .addClass("cq-targeting-experience-quickactions-delete")
                        .attr("title", CQ.I18n.getMessage("Delete experience"))
                        .click(function() {
                            var origin = this;

                            CQ.Ext.Msg.confirm(
                                CQ.I18n.getMessage("Confirm experience deletion"),
                                CQ.I18n.getMessage("Are you sure you want to delete this experience? This will delete all content for all locations that use this experience!"),
                                function(btnId) {
                                    if ( btnId === "yes") {
                                        that.deleteExperience($CQ(origin).parents('li').attr('data-cq-experience'));
                                    }
                                }
                            );
                            return false;
                        })
                        .appendTo(quickActions);
                } else {
                    // show the delete
                    $CQ("<div>")
                        .addClass("cq-targeting-experience-quickactions-remove")
                        .attr("title", CQ.I18n.getMessage("Remove offer"))
                        .click(function() {
                            var origin = this;

                            CQ.Ext.Msg.confirm(
                                CQ.I18n.getMessage("Confirm offer removal"),
                                CQ.I18n.getMessage("Are you sure you want to remove the offer for this experience?"),
                                function(btnId) {
                                    if ( btnId === "yes") {
                                        // remove the offer and reload the experiences
                                        that.removeOffer($CQ(origin).parents('li').attr('data-cq-experience'), function(){
                                            that.reloadExperiencesInPopup(true);
                                        });
                                    }
                                }
                            );
                            return false;
                        })
                        .appendTo(quickActions);
                }

            }

            return item;
        },

        /**
         * Loads all experiences in the editor popup (but not show the popup).
         * Will make sure experiences are loaded first before calling callback.
         * Won't load experiences again if forceLoad==false. Also finds the
         * individual offers for the target component.
         */
        reloadExperiencesInPopup: function(forceLoad, callback) {

            if (this._reloadInProgress) {
                _debug.call(this, "Reload in progress, not refreshing...");
                return;
            }
            _debug.call(this, "Begin reloading experiences in popup...");
            this._reloadInProgress = true;
            var that = this;

            // update the sync error message on each reload
            if ( this.campaign ) {
                $CQ.ajax(this.campaign+"/_jcr_content.json").done(function(campaignContent) {
                    that.updateSyncError(campaignContent);
                });
            }
            
            // nothing to do if we are not forced to reload and offers are present
            if (this.offers && !forceLoad) {
                if (callback) {
                    callback.call(this);
                }
                _debug.call(this, "Finished reloading experiences in popup (nothing to do)");
                this._reloadInProgress = false;
                return;
            }

            // backup the current offers
            this.offersBackup = this.offers;

            // map experience => offers
            this.offers = {};
            // empty the contentDiv
            this.contentDiv.empty();
            if (!this.campaign) {
                // if no campaign is selected show the text
                that.contentDiv.addClass("cq-targeting-editor-clientcontext-hint");
                var text = $CQ("<span>")
                    .text(CQ.I18n.getMessage("No campaign selected."))
                    .appendTo(that.contentDiv);
                if ( forceLoad && callback ) {
                    callback.call(this);
                }
                _debug.call(this, "Finished reloading experiences in popup (no campaign)");
                this._reloadInProgress = false;
                return;
            } else {
                _debug.call(this, "Initializing the image carousel");
                // ---- Initialize the image carousel here
                this.carouselContainer = $CQ("<div>").addClass("jcarousel-container").css({"position":"relative"}).appendTo(this.contentDiv);
                this.carouselWrapper = $CQ("<div>").addClass("jcarousel").appendTo(this.carouselContainer);
                $CQ("<div>").addClass("jcarousel-prev-horizontal").appendTo(this.carouselContainer);
                $CQ("<div>").addClass("jcarousel-next-horizontal").appendTo(this.carouselContainer);

                this.carousel = $CQ("<ul>").appendTo(this.carouselWrapper);

                this.carouselWrapper.jcarousel({
                    vertical: false,
                    items:".jcarousel-item"
                });

                $CQ(".jcarousel-prev-horizontal").jcarouselControl({
                    target: '-=2'
                });
                $CQ('.jcarousel-next-horizontal').jcarouselControl({
                    target: '+=2'
                });
                // ---- END carousel initialization

            }

            // retrieve all experiences from the server & find matching offers for this mbox
            // TODO: custom json (to avoid recursion-too-deep issue)
            _debug.call(that, "Retrieving campaign tree");
            $CQ.ajax(this.campaign + ".infinity.json?ck=" + new Date()).done(function(campaign) {
                _debug.call(that, "Campaignt tree retrieved.");
                that.campaignTree = campaign;

                var selectedExperience = ClientContext.get(EXPERIENCE_PROP);
                if (!selectedExperience) {
                    // safety fallback: if no experience is selected, use DEFAULT
                    selectedExperience = CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE;
                }
                var selectedItemIdx = -1;

                // entry for default content
                that.offers[CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE] = that.component.path;

                if (selectedExperience === CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE) {
                    selectedItemIdx = 0;
                }

                that.carousel.append(that.createExperienceItem(
                    that.component.path + ".thumb.png?cq_ck=" + Date.now(),
                    CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE,
                    CQ.I18n.getMessage("Default")
                ));

                var itemCounter = 1;
                _debug.call(that, "Iterating experiences.");
                // existing experiences
                $CQ.each(campaign, function(experienceName, experience) {
                    if (experience["jcr:content"] &&
                        experience["jcr:content"]["sling:resourceType"] === "cq/personalization/components/experiencepage") {
                        // experience found
                        _debug.call(that, "Searching offers for experience " + experienceName);
                        var offer = that.findOffer(experience, that.mboxLocation);
                        if (offer !== null) {
                            _debug.call(that, "Offer found " + offer.name);
                        } else {
                            _debug.call(that, "Offer not found");
                        }
                        var experiencePath = that.campaign + "/" + experienceName;
                        var imgUrl;
                        if (offer !== null) {
                            var offerPath = experiencePath + "/" + offer.name;
                            imgUrl = offerPath + ".thumb.png?cq_ck=" + Date.now();
                            that.offers[experiencePath] = offerPath;
                        } else {
                            // missing offer, show nothing yet
                            imgUrl = "";
                            that.offers[experiencePath] = null;
                        }

                        if (experiencePath === ClientContext.get(EXPERIENCE_PROP)) {
                            selectedItemIdx = itemCounter;
                        }

                        that.carousel.append(that.createExperienceItem(
                            imgUrl,
                            experiencePath,
                            experience["jcr:content"]["jcr:title"] || experienceName
                        ));
                        itemCounter++;
                    }
                });

                // mark selected experience
                if (selectedExperience) {
                    $CQ(that.carousel).find('li[data-cq-experience="' + selectedExperience + '"]').addClass("cq-targeting-experience-selected");
                    that.activeExperienceIndex = selectedItemIdx;
                }

                // tell the carousel to reload since we altered the list
                that.carouselWrapper.jcarousel("reload");

                // Scroll to the experience.
                that.carouselWrapper.jcarousel("scroll",that.activeExperienceIndex, true);

                if (callback) {
                    _debug.call(that, "Running callback...");
                    callback.call(that);
                }
                that.offersBackup = {};
                _debug.call(that, "Finish reloading experiences in popup...");
                that._reloadInProgress = false;
            }).fail(function() {
                CQ.Notification.notify("Could not load experiences");
                that._reloadInProgress = false;
                that.offersBackup = {};
            });
        },

        // recursively search for offers with the right @location
        findOffer: function(experience, location) {
            var result = null;
            $CQ.each(experience, function(offerName, child) {
                if (child["jcr:primaryType"] === "cq:Page") {
                    if (child["jcr:content"] && child["jcr:content"].location === location) {
                        result = {
                            name: offerName,
                            obj: child
                        };
                        return true;
                    }
                }
            });
            return result;
        },

        /** handles the click on the "add experience" button */
        addExperience: function () {
            var that = this;

            // if no campaign is selected, ignore
            if (!that.campaign) {
                return;
            }
            if (!that.segmentDialogShown) {
                that.segmentDialogShown = true;
                
                $CQ.ajax("/etc/segmentation.infinity.json").done(function(segmentTree) {
                    var segments = {};
                    var targetReferenceSegments = {};
                    segmentTree.path = "/etc/segmentation";
                    traverse(segmentTree, function(key, obj, parent) {
                        if (parent) {
                            obj.path = parent.path + "/" + key;
                        }
                        if (obj["jcr:content"] &&
                            obj["jcr:content"]["sling:resourceType"] === "cq/personalization/components/segmentpage") {
                            
                            segments[obj.path] = {
                                path: obj.path,
                                name: key,
                                title: obj["jcr:content"]["jcr:title"] || key
                            };

                            // detect Adobe Target segments
                            traverse(obj, function(traitKey, traitObject, parentSegment) {
                                if ( traitObject["sling:resourceType"] === "cq/personalization/components/traits/tandt" ) {
                                    targetReferenceSegments[obj.path] = true;
                                }
                            });
                        }
                    });
                    
                    var width = 300;
                    // build segment selection "dialog" UI
                    var dialog = $CQ("<div>")
                        .addClass("cq-targeting-experience-dialog")
                        .css("position", "absolute")
                        .css("top", (that.addEl.offset().top + 33) + "px")
                        .css("left", (that.addEl.offset().left - 5) + "px")
                        .css("width",  width + "px")
                        .css("height", "100px");

                    $CQ("<h3>").text(CQ.I18n.getMessage("Choose Segment:")).appendTo(dialog);

                    // find used segments
                    var usedSegments = {};
                    if (that.campaignTree) {
                        traverse(that.campaignTree, function(key, obj, parent) {
                            if (obj["sling:resourceType"] === "cq/personalization/components/experiencepage") {
                                var segments = obj["cq:segments"];
                                
                                if ($CQ.isArray(segments)) {
                                    $CQ.each(segments, function(idx, segment) {
                                        usedSegments[segment] = true;
                                    });
                                } else if (typeof segments === "string") {
                                    usedSegments[segments] = true;
                                }
                            }
                        });
                    }
                    
                    var select = $CQ("<select>")
                        .css("width",width + "px")
                        .appendTo(dialog);

                    $CQ.each(segments, function(path, segment) {
                        var title = segment.title;
                        var isUsed = usedSegments[segment.path];
                        var isFromTarget = targetReferenceSegments[segment.path];
                        
                        if ( isUsed && isFromTarget ) {
                            title = title + CQ.I18n.getMessage(" (in use, from Target)");
                        } else if ( isUsed ) {
                            title = title + CQ.I18n.getMessage(" (in use)");
                        } else if ( isFromTarget ) {
                            title = title + CQ.I18n.getMessage(" (from Target)");
                        }
                        
                        $CQ("<option>")
                            .attr("value", segment.path)
                            .text(title)
                            .appendTo(select);
                    });

                    var inspectLink = $CQ("<a>")
                        .addClass("cq-targeting-segment-link")
                        .attr("target", "_blank")
                        .text(CQ.I18n.getMessage("Inspect"))
                        .appendTo(dialog);

                    select.change(function() {
                        inspectLink.attr('href', select.find(':selected').val() + ".html");
                    });

                    $CQ("<input>").attr("type", "submit").attr("value", CQ.I18n.getMessage("Add")).click(function() {
                        var segment = segments[$CQ(select).val()];
                        if (segment) {
                            that.createExperience(segment.name, segment.title, segment.path);
                        }

                        $CQ(dialog).remove();
                        that.segmentDialogShown = false;
                    }).appendTo(dialog);

                    $CQ("<input>").attr("type", "submit").attr("value", CQ.I18n.getMessage("Cancel")).click(function() {
                        $CQ(dialog).remove();
                        that.segmentDialogShown = false;
                    }).appendTo(dialog);

                    $CQ("#CQ").append(dialog);
                });
            }
        },

        toggle: function() {
            if (this.shown) {
                this.hide();
            } else {
                this.show();
            }
        },

        // position the popup above the components dom element
        position: function() {
            if (this.shown) {
                var anchor = $CQ(this.component.element.dom);

                // if the anchor is hidden then most probably the settings dialog is opened
                // in which case we want the experience dialog hidden too
                if ('none' === anchor.css("display")) {
                    this.el.css("display","none");
                } else {
                    this.el.css("top",   anchor.offset().top  + "px")
                        .css("left",  anchor.offset().left + "px")
                        .css("width", anchor.width()       + "px")
                        .css("display", "block");
                    if (this.el.offset().top < 0) {
                        this.el.offset({top: 0});
                    }
                }
            } else {
                this.positionOverlayIcon();
            }
        },

        positionOverlayIcon: function() {
            var anchor = $CQ(this.component.element.dom);

            var ICON_SIZE = 40; // keep in sync with height + width of cq-targeting-launch-icon in target.less

            this.overlayIcon.css("top",  (anchor.offset().top + anchor.height() - ICON_SIZE) + "px")
                            .css("left", (anchor.offset().left + anchor.width() - ICON_SIZE) + "px");
        },

        showOverlayIcon: function() {
            // do not show the overlay icon while the experience popup is open
            // and not if we are in preview mode
            if (!this.shown && !CQ.WCM.isPreviewMode()) {
                if( $CQ.support.opacity) {
                    this.overlayIcon.fadeIn("normal");
                } else {
                    this.overlayIcon.show();
                }
            }
        },

        hideOverlayIcon: function() {
            if( $CQ.support.opacity) {
                this.overlayIcon.fadeOut("fast");
            } else {
                this.overlayIcon.hide();
            }
        },

        show: function() {
            this.shown = true;

            // make sure experiences are loaded if not yet
            // (usually done by ClientContext update already)
            this.reloadExperiencesInPopup();

            // bring into position before fade in
            this.position();

            // do not show the overlay icon while the experience popup is open
            this.hideOverlayIcon();

            if( $CQ.support.opacity) {
                this.el.fadeIn("normal");
            } else {
                this.el.show();
            }

            // the carousel will only "scroll" when visible.
            if (this.campaign) {
                this.carouselWrapper.jcarousel("scroll", this.activeExperienceIndex, true);
            }
        },

        hide: function() {
            if( $CQ.support.opacity) {
                this.el.fadeOut("fast");
            } else {
                this.el.hide();
            }
            this.shown = false;
        },

        remove: function() {
            this.el.remove();
            this.overlayIcon.remove();
            if (this.missingOfferPlaceholder) {
                this.missingOfferPlaceholder.remove();
            }

            var campaignStore = ClientContext.get("campaign");
            if (campaignStore) {
                campaignStore.removeListener("update", this.onCampaignUpdate);
            }

            CQ.WCM.un("editableready", this.onEditableReady, this);
        }
    };

    /**
     * Gets or creates the TargetEditor object for a target component.
     * @param {CQ.wcm.EditBase} component a CQ.wcm.EditBase instance for a target component
     */
    CQ.personalization.TargetEditor.get = function(component) {
        if (!component.targetEditor) {
            component.targetEditor = new CQ.personalization.TargetEditor(component);
        }
        return component.targetEditor;
    };

}());

/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */


// Analytics mode for the implicit mbox
/**
 * Analytics UI for the Implicit Mbox component
 *
 * @constructor
 *
 * @param {HTMLDomElement} parent The parent DOM element for this component
 * @param {String} location The location of the target component
 */
CQ.personalization.TargetAnalyticsOverlay = function(parent, location) {

    this.parent = parent;
    this.location = location;

    if ( $CQ(parent).find('.cq-analyzable-overlay').length === 0 ) {
        
        var that = this;
        
        this.overlay = $CQ('<div>').attr('class', 'cq-analyzable-overlay-contents');
        
        var closeButton = $CQ('<div>').attr('class','cq-analyzable-overlay-close');
        closeButton.click(function() {
            that.toggle(null);
        })

        $CQ(parent).append(
            $CQ('<div>').attr('class', 'cq-analyzable-overlay').append(
                $CQ('<div>').attr('class','cq-analyzable-overlay-background-1').append(
                    closeButton, this.overlay
                )
            )
        );
    } else {
        this.overlay = $CQ(parent).find('.cq-analyzable-overlay-contents');
    }
};

CQ.personalization.TargetAnalyticsOverlay.prototype = {

    BAR_MAX_WIDTH_PX : 220,
    DEFAULT_THUMBNAIL: "/libs/cq/ui/widgets/themes/default/icons/240x180/page.png",

    TT_CAMPAIGN_PAGE: "/admin/campaign/spotlight/campaign_spotlight.jsp?campaignDescriptionId=",

    /**
     * Toggles the visibility of this component and - if visible - displays the performance report
     * for the the specified <tt>campaignPath</tt>
     *
     * @public
     */
    toggle: function(campaignPath) {

        var topOverlay = $CQ(this.parent).find('.cq-analyzable-overlay');

        if ( topOverlay.is(':visible') ) {
            topOverlay.hide();
        } else {
            topOverlay.show();
                if ( campaignPath === '') {
                    this.displayMessage(CQ.I18n.get("No campaign selected.") + " ");
                    var link = $CQ("<a>")
                        .attr("href", "#")
                        .text(CQ.I18n.getMessage("See Client Context") + " ")
                        .click(function() {
                            CQ_Analytics.ClientContextUI.show();
                            return false;
                        })
                        .appendTo(this.overlay);
                    $CQ("<img>")
                        .attr("src", CQ.shared.HTTP.externalize("/libs/cq/ui/widgets/themes/default/icons/16x16/clientcontext.png"))
                        .appendTo(link);
                } else {
                    this.showAnalyticsForCampaign(campaignPath);
                }
        }
    },

    /**
     * Installs a listener on the campaign which refreshes the performance report for newly selected campaigns
     * when this component is visible.
     *
     * @public
     */
    installCampaignStoreListener: function() {

        var that = this;
        var campaignStore = ClientContext.get("campaign");
        if ( !campaignStore )
            return;

        campaignStore.addListener("update", function(event, property) {
            if ( ( property === "path" || $CQ.inArray("path", property) ) && ClientContext.get("campaign/path") !== '' )
                if ( $CQ(that.parent).find('.cq-analyzable-overlay').is(':visible') ) {
                    that.showAnalyticsForCampaign(ClientContext.get("campaign/path"), this.location);
                }
        }, this);
    },

    /**
     * Displays the most significant part of a number in a human-readable format
     *
     * <p>For instance, 12500 would be displayed as 12k</p>
     */
    displayCompressedNumber: function(number) {

        var millions = number / 1000000;
        if ( millions > 1 )
            return Math.round(millions) + CQ.I18n.get("m", [], "A shorthand notation for millions.");

        var thousands = number / 1000;
        if ( thousands > 1 )
            return Math.round(thousands) + CQ.I18n.get("k", [], "A shorthand notation for thousands");

        return number;

    },

    /**
     * @private
     */
    showAnalyticsForCampaign: function(campaignPath) {
        var url = CQ.shared.HTTP.externalize("/libs/cq/analytics/testandtarget/command");
        this.overlay.text(CQ.I18n.get('Loading campaign analytics...'));

        var that = this;

        $CQ.post(url, { 'cmd': 'getPerformanceReport', 'campaignPath': campaignPath, 'location': this.location},
            function(response) {
                if ( response.error ) {
                    that.overlay.text(response.error);
                    return;
                }

                that.overlay.empty();

                var legend = $CQ('<div>').attr('class', 'cq-analyzable-legend');

                var conversionsLegend = $CQ('<div>').attr('class', 'cq-analyzable-legend-lift');

                $CQ('<span>').text(CQ.I18n.get('LIFT')).appendTo(conversionsLegend);
                var liftLegend = $CQ('<div>').attr('class', 'cq-analyzable-legend-lift-image').appendTo(conversionsLegend);
                $CQ('<div>').attr('class', 'cq-analyzable-legend-lift-image-negative').appendTo(liftLegend);
                $CQ('<div>').attr('class', 'cq-analyzable-legend-lift-image-positive').appendTo(liftLegend);


                var impressionsLegend = $CQ('<div>').attr('class', 'cq-analyzable-legend-impressions');
                $CQ('<div>').attr('class', 'cq-analyzable-legend-impressions-image').appendTo(impressionsLegend);
                $CQ('<span>').text(CQ.I18n.get('VISITORS')).appendTo(impressionsLegend);

                legend.append(conversionsLegend).append(impressionsLegend).appendTo(that.overlay);

                if ( response.experiences && response.experiences.length > 0 ) {

                    var defaultExperienceConversionRate;
                    var maxConversionRate = 0;
                    $CQ.each(response.experiences, function(index, experience)  {
                        if ( index === 0 )
                            defaultExperienceConversionRate = that.conversionRate(experience);

                        maxConversionRate = Math.max(maxConversionRate, that.conversionRate(experience));
                    });

                    $CQ.each(response.experiences, function (index, experience) {

                        var highlight = [];
                        var isDefault = index === 0;
                        var conversionRate = that.conversionRate(experience);
                        var isWinner = conversionRate === maxConversionRate && conversionRate > 0;
                        var liftPercentage = '';
                        var liftClass = '';
                        if ( !isDefault )  {
                            liftPercentage = that.percentage(maxConversionRate, conversionRate - defaultExperienceConversionRate, true);
                            liftClass = liftPercentage.charAt(0) == '+' ? 'cq-analyzable-row-lift-positive' : 'cq-analyzable-row-lift-negative';
                        }

                        var row;
                        var wrapper;
                        if ( isWinner ) {
                            wrapper = $CQ('<div>');
                            $CQ('<div>').attr('class', 'cq-analyzable-row-winner-marker').appendTo(wrapper);
                            row = $CQ('<div>').attr('class', 'cq-analyzable-row');
                            row.addClass('cq-analyzable-row-winner');
                            row.appendTo(wrapper);
                        } else {
                            row = $CQ('<div>').attr('class', 'cq-analyzable-row');
                        }

                        var iconDiv = $CQ('<div>').attr('class', 'cq-analyzable-row-icon').appendTo(row);

                        var thumb = experience.thumbnail ? CQ.shared.HTTP.externalize(experience.thumbnail) : that.location + '.thumb.png';
                        var thumbImage = $CQ('<img>').attr('src', thumb ).appendTo(iconDiv);
                        CQ_Analytics.onImageLoad(thumb, function(img) {
                            var w = img.width;
                            var h = img.height;
                            if (img.w == 0) {
                                // this means the image is missing so we need to
                                // replace it with the placeholder.
                                // this usually happens when the targeted component is not an image.
                                thumb.attr("src",that.DEFAULT_THUMBNAIL);
                                // ugly, hardcode the values
                                w = 240;
                                h = 180;
                            }
                            // keep target image size in sync with .cq-analyzable-row-icon width and height in analytics.less
                            var scaled = CQ_Analytics.scaleImage(w, h, 60, 44);
                            thumbImage.width(scaled.width);
                            thumbImage.height(scaled.height);
                            thumbImage.css("top", scaled.top);
                            thumbImage.css("left", scaled.left);
                            thumbImage.fadeIn();
                        });

                        var rowFirst = $CQ('<div>').attr('class', 'cq-analyzable-row-first');
                        if ( liftPercentage )
                            $CQ('<div>').attr('class', liftClass).text(liftPercentage).appendTo(rowFirst);
                        var experienceDiv = $CQ('<div>').attr('class', 'cq-analyzable-row-experience').text(experience.name).appendTo(rowFirst);

                        if ( isDefault ) {
                            $CQ('<span>').attr('class', 'cq-analyzable-row-highlight-default').text(CQ.I18n.get('DEFAULT')).appendTo(experienceDiv);
                        }

                        if ( isWinner ) {
                            $CQ('<span>').attr('class', 'cq-analyzable-row-highlight-winner').text(CQ.I18n.get('WINNER')).appendTo(experienceDiv);
                        }

                        var rowSecond = $CQ('<div>').attr('class', 'cq-analyzable-row-second');
                        $CQ('<div>').attr('class', 'cq-analyzable-row-impression-count').text(that.displayCompressedNumber(experience.impressions)).appendTo(rowSecond);
                        $CQ('<div>').attr('class', 'cq-analyzable-row-conversion-rate').text(that.percentage(experience.impressions, experience.conversions)).appendTo(rowSecond);

                        that.drawConversionBars(rowSecond, conversionRate, maxConversionRate, isDefault);

                        rowFirst.appendTo(row);
                        rowSecond.appendTo(row);

                        if ( wrapper )
                            that.overlay.append(wrapper);
                        else
                            that.overlay.append(row);
                    });
                    if (response.campaignId && response.campaignId !== null) {
                        that.renderDeepLink(response.account,response.campaignId);
                    }
                } else {
                    that.overlay.append($CQ("<div>").text(
                            CQ.I18n.get('No performance data returned by the Adobe Target API. Make sure that your campaign is activated and mboxes are accessed on a publish instance.')));
                }

            }
        );
    },

    /**
     * Retrieves the admin server URL for a certain account
     * @param account
     * @param campaignId
     * @private
     */
    renderDeepLink: function(account, campaignId) {
        var endpointUrl = CQ.shared.HTTP.externalize("/libs/cq/analytics/testandtarget/adminserver");
        var that = this;
        $CQ.get(endpointUrl,{account:account}, function(response){
            if ( response.error ) {
                that.overlay.text(response.error);
                return;
            }

            // the response should not contain status. If it does, something is wrong on T&T side
            if (response.status) {
                that.overlay.text(response.status + ' - ' + response.message);
                return;
            }

            //extract just the server name from the response...
            var adminServerUrl = response.api.match("https?:\/\/[a-z0-9.]+");
            //...and then append the campaign spotlight URL
            var link = adminServerUrl + that.TT_CAMPAIGN_PAGE + campaignId;

            var ttPageLinkContainer = $CQ("<div>").addClass("cq-analyzable-static-text");
            $CQ("<a>").attr({"href":link, "target":"_blank"}).html(CQ.I18n.get('Click here for more details')).appendTo(ttPageLinkContainer);

            that.overlay.append(ttPageLinkContainer);
        });
    },

    /**
     * @private
     */
    conversionRate: function(experience) {

        if ( experience.conversions === 0 || experience.impressions === 0  )
            return 0;

        return experience.conversions / experience.impressions;
    },

    /**
     * @private
     */
    percentage: function(total, slice, forceSign) {
        if ( total === 0 || slice === 0 )
            return '0%';

        if ( typeof forceSign === "undefined ")
            forceSign = false;

        var prefix;
        if ( forceSign ) {
            prefix = ( slice >= 0 ? '+ ' : '- ');
        } else {
            prefix = ( slice >= 0 ? '' : '-');
        }

        return prefix + Math.abs(( 100 * slice / total ).toFixed(2)) + '%';
    },

    /**
     * @private
     */
    displayMessage: function(message) {
        this.overlay.text(message);
    },

    /**
     * @private
     */
    drawConversionBars: function(row, conversionRate, maxConversionRate, isDefault) {

        var baseBarWidth;
        var positiveLiftBarWidth = 0;
        var negativeLiftBarWidth = 0;
        var conversionRateRatio = ( conversionRate / maxConversionRate );
        if ( isDefault) {
            baseBarWidth = conversionRateRatio * this.BAR_MAX_WIDTH_PX;
            defaultExperienceConversionRate = conversionRate;
        } else {
            var conversionDelta = (conversionRate - defaultExperienceConversionRate) / maxConversionRate;
            var defaultExperienceBaseBarWidth = defaultExperienceConversionRate / maxConversionRate * this.BAR_MAX_WIDTH_PX;
            if ( conversionDelta > 0 ) { // positive lift
                baseBarWidth = defaultExperienceBaseBarWidth;
                if ( baseBarWidth !== 0 ) {
                    positiveLiftBarWidth = baseBarWidth * conversionDelta;
                } else {
                    positiveLiftBarWidth = this.BAR_MAX_WIDTH_PX * conversionDelta;
                }
            } else { // negative lift
                negativeLiftBarWidth = - conversionDelta * this.BAR_MAX_WIDTH_PX;
                baseBarWidth = (defaultExperienceConversionRate / maxConversionRate * this.BAR_MAX_WIDTH_PX  )- negativeLiftBarWidth;
            }
        }

        var bars = $CQ('<div>').attr('class', 'analyzable-row-bars').appendTo(row);

        $CQ('<div>').attr('class', 'analyzable-row-bar-default').css('width', baseBarWidth + 'px').appendTo(bars);
        if ( positiveLiftBarWidth !== 0 )
            $CQ('<div>').attr('class', 'analyzable-row-bar-positive-lift').css('width', positiveLiftBarWidth+ 'px').appendTo(bars);
        if ( negativeLiftBarWidth !== 0 )
            $CQ('<div>').attr('class', 'analyzable-row-bar-negative-lift').css('width', negativeLiftBarWidth + 'px').appendTo(bars);
    }
};
