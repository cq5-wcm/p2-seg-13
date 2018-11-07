/**
 * Opens up a modified browse field dialog for choosing a component from the component library.
 * 
 * @author ewiesenhuetter, namics (deutschland) gmbh
 * @since GMDS Release 1.7
 */
CQ.form.CLBrowseField = CQ.Ext.extend(CQ.Ext.form.TriggerField, {
    /**
     * The panel holding the link-browser.
     * @private
     * @type CQ.BrowseDialog
     */
    browseDialog: null,

    /**
     * @private
     * Creates a new {@link CQ.BrowseDialog BrowseDialog}, if it has not been
     * created before, then shows it.
     **/
    onTriggerClick : function() {
		if (this.browseDialog == null) {
			var _that = this, _nameValue = "";
			// root node id, equals TreeNode.RootNode.CL value (enum)
			var _rootId = 'cl-root-node';
			// the auto-generated id for the preview panel
			var _previewId = 'cq-cl-comp-' + (++CQ.Ext.Component.AUTO_ID);
			// fetching tree using servlet, like browsefield does
			var _dataUrl = '/bin/exttreerender.json';
			// fetch parent
			var _parent = _that.findParentByType('dialog');
			// init tree loader
			var _loader = new CQ.Ext.tree.TreeLoader({
	        	dataUrl		: _dataUrl,
	        	baseParams	: {
	        		walker	: 1
	        	},
	        	requestMethod	: 'GET'
	        });
			_loader.on("beforeload", function(treeLoader, node) {	
				if (_rootId === node.attributes.id) {
					treeLoader.baseParams.resourcePath = encodeURIComponent(_parent.path);
				} else  {
					delete treeLoader.baseParams['resourcePath'];
				}
		    }, this);
			// dialog configuration
	        var _clDialog = {
	            'jcr:primaryType'	: 'cq:Dialog',
	            title				: 'Select Path',
	            buttons				: CQ.Dialog.OKCANCEL, 
	            height				: 600,
	            width				: 800,
	            modal				: true,
	            shadow				: true, 
	            "ok" : function() {
		        	if (this.browseField) {	                    
		        		this.browseField.setValue(_nameValue);
	                }
	                this.hide();
	        	},
	            items				: {
	                'jcr:primaryType'	: 'cq:Panel',
	                layout				: 'border',
	                items				: [{
	                    region			: 'west',
	                    collapsible		: false,
	                    xtype			: 'treepanel',
	                    width			: 200,
	                    autoScroll		: true,
	                    containerScroll	: true,
	                    split			: true,
	                    animate			: true,
	                    rootVisible		: true,
	                    enableDD		: false,
	                    loader			: _loader,
	                    root			: {
	                    	nodeType			: 'async',
	                        text				: 'Component Library',
	                        id					: _rootId,
	                        expanded			: true,
	                        singleClickExpand	: true
	                    },                    
	                    listeners	: {
	                        click	: function(n) {
	                			if (n.attributes.leaf) {
	                				var preview = CQ.Ext.getCmp(_previewId);	                				
	                				if (typeof preview !== 'undefined') {
	                					new CQ.Ext.LoadMask(preview.body, {msg:"Loading..."}).show();
	                					CQ.Ext.Ajax.request({
	                						url				: _parent.path + '.preview.html',
	                						disableCaching	: true,
	                						method			: 'GET',
	                						params			: {
	                							template : encodeURIComponent(n.attributes.hrefTarget)
	                						},
	                						success	: function(response, opts) {
	                							preview.body.update(response.responseText);
	                							var elements = CQ.Ext.DomQuery.select('div.cl-container-preview', _previewId);
	                							var items = [];
	                							CQ.Ext.each(elements, function(element){
	                								var el = CQ.Ext.get(element);
	                								el.on('click', function() {
	                									if (items.length > 0) {
	                										var id = items[0];
	                										if (el.id !== id) {
	                											items.pop();
	                											CQ.Ext.get(id).removeClass('selected');
	                										}
	                									}
	                									if (!el.hasClass('selected')) {
	                										el.addClass('selected');
	                										items.push(el.id);
	                									}
	                									_nameValue = el.getAttribute('data-resource-path');
	                								});
	                					        }, this);
	                						},
	                						failure	: function(response, opts) {
	                							preview.body.update("");
	                							CQ.Ext.Msg.show({
	                				                title	: CQ.I18n.getMessage('Error'),
	                				                msg		: CQ.I18n.getMessage(response.responseText),
	                				                buttons	: CQ.Ext.Msg.OK,
	                				                icon	: CQ.Ext.Msg.ERROR
	                				            });
	                						}
	                					});
	                				}
	                			}
	                        },
	                        hide	: function() {
	                            if (this.browseField) {
	                            	this.browseField.fireEvent("dialogclose");
	                            	this.browseField.fireEvent("browsedialog.closed"); // deprecated since 5.3
	                            }
	                        }
	                    }
	                }, {
	                	region			: 'center',
	                    xtype			: 'panel',
	                    id				: _previewId,
	                    autoScroll		: true,
	                    containerScroll	: true
	                }]
	            }
	        };
	        this.browseDialog = CQ.Util.build(_clDialog);
	        this.browseDialog.browseField = _that;
		}		
        this.browseDialog.show();
        this.fireEvent("dialogopen");
        this.fireEvent("browsedialog.opened"); // deprecated since 5.3
    },

    constructor : function(config){
        CQ.form.CLBrowseField.superclass.constructor.call(this, config);
    },    
    // overriding CQ.Ext.Component#initComponent
    initComponent : function(){
        CQ.form.CLBrowseField.superclass.initComponent.call(this);
        this.addEvents(
            /**
             * @event browsedialog.opened
             * Fires when the browse dialog is opened.
             * @param {CQ.form.BrowseField} this
             * @deprecated Use {@link CQ.form.BrowseField#dialogopen dialogopen} instead
             */
            "browsedialog.opened",
            /**
             * @event dialogopen
             * Fires when the browse dialog is opened.
             * @param {CQ.form.BrowseField} this
             * @since 5.3
             */
            "dialogopen",
            /**
             * @event dialogSelect
             * Fires when a new value is selected in the browse dialog.
             * @param {CQ.form.BrowseField} this
             * @deprecated Use {@link CQ.form.BrowseField#dialogselect dialogselect} instead
             */
            "dialogSelect",
            /**
             * @event dialogselect
             * Fires when a new value is selected in the browse dialog.
             * @param {CQ.form.BrowseField} this
             * @since 5.3
             */
            "dialogselect",
            /**
             * @event browsedialog.closed
             * Fires when the browse dialog is closed.
             * @param {CQ.form.BrowseField} this
             * @deprecated Use {@link CQ.form.BrowseField#dialogclose dialogclose} instead
             */
            "browsedialog.closed",
            /**
             * @event dialogclose
             * Fires when the browse dialog is closed.
             * @param {CQ.form.BrowseField} this
             * @since 5.3
             */
            "dialogclose"
        );
    }
});
CQ.Ext.reg("clbrowsefield", CQ.form.CLBrowseField);
/**
 * @class CQ.form.rte.commands.ExtendedLink
 * @extends CQ.form.rte.commands.Command
 * @private
 */

CQ.form.rte.commands.ExtendedLink = CQ.Ext.extend(CQ.form.rte.commands.Command,{
    
    /**
     * Creates a styled link from the current selection.
     * @private
     */
    addLinkToDom: function(execDef) {
        var context = execDef.editContext;
        var nodeList = execDef.nodeList;
        var url = execDef.value.url;
        var styleName = execDef.value.css;
        var target = execDef.value.target;
        var attributes = execDef.value.attributes || { };
        var links = [ ];
        nodeList.getAnchors(context, links, true);
        if (links.length > 0) {
            // modify existing link(s)
            for (var i = 0; i < links.length; i++) {
                this.applyLinkProperties(links[i].dom, url, styleName, target, attributes);
            }
        } else {
            // create new link
            var sel = CQ.form.rte.Selection;
            var dpr = CQ.form.rte.DomProcessor;
            if (execDef.value.trimLinkSelection === true) {
                var range = sel.getLeadRange(context);
                range = sel.trimRangeWhitespace(win, range);
                sel.selectRange(context, range);
                nodeList = dpr.createNodeList(context, sel.createProcessingSelection(context));
            }
            // handle HREF problems on IE with undo (IE will deliberately change the
            // HREF, causing the undo mechanism to fail):
            var helperSpan = context.createElement("span");
            helperSpan.innerHTML = "<a href=\"" + url + "\"></a>";
            attributes.href = helperSpan.childNodes[0].href;
            attributes[CQ.form.rte.Common.HREF_ATTRIB] = url;
            if (styleName) {
                attributes.className = styleName;
            }
            if (target) {
                attributes.target = target;
            } else {
                delete attributes.target;
            }
            for (var key in attributes) {
                if (attributes.hasOwnProperty(key)) {
                    var attribValue = attributes[key];
                    if ((attribValue == null) || (attribValue.length == 0) || (attribValue == CQ.form.rte.commands.Link.REMOVE_ATTRIBUTE)) {
                        delete attributes[key];
                    }
                }
            }
            nodeList.surround(context, "a", attributes);
        }
    },

    /**
     * Applies link properties (href, style, target) to the given anchor dom element.
     * @param {HTMLElement} dom DOM element the link properties will be applied (should be
     * @param {String} url URL/href to set
     * @param {String} styleName Name of CSS class to apply
     * @param {String} target target frame of the link
     * @param {Object} addAttributes additional attributes
     * @private
     */
    applyLinkProperties: function(dom, url, styleName, target, addAttributes) {
        var com = CQ.form.rte.Common;
        dom.href = url;
        dom.setAttribute(CQ.form.rte.Common.HREF_ATTRIB, url);
        if (target) {
            com.setAttribute(dom, "target", target);
        } else {
            com.removeAttribute(dom, "target");
        }
        if (styleName) {
            com.setAttribute(dom, "class", styleName);
        } else {
            com.removeAttribute(dom, "class");
        }
        for (var attribName in addAttributes) {
            if (addAttributes.hasOwnProperty(attribName)) {
                var attribValue = addAttributes[attribName];
                if (attribValue && (attribValue.length > 0) && (attribValue != CQ.form.rte.commands.Link.REMOVE_ATTRIBUTE)) {
                    com.setAttribute(dom, attribName, attribValue);
                } else {
                    com.removeAttribute(dom, attribName);
                }
            }
        }
    },

    /**
     * Removes a styled link according to the current selection.
     * @private
     */
    removeLinkFromDom: function(execDef) {
        var dpr = CQ.form.rte.DomProcessor;
        var context = execDef.editContext;
        var nodeList = execDef.nodeList;
        var links = [ ];
        nodeList.getAnchors(context, links, true);
        for (var i = 0; i < links.length; i++) {
            dpr.removeWithoutChildren(links[i].dom);
        }
    },

    isCommand: function(cmdStr) {
        var cmdLC = cmdStr.toLowerCase();
        return (cmdLC == "modifylink") || (cmdLC == "unlink");
    },

    getProcessingOptions: function() {
        var cmd = CQ.form.rte.commands.Command;
        return cmd.PO_BOOKMARK | cmd.PO_SELECTION | cmd.PO_NODELIST;
    },

    execute: function(execDef) {
        switch (execDef.command.toLowerCase()) {
            case "modifylink":
                this.addLinkToDom(execDef);
                break;
            case "unlink":
                this.removeLinkFromDom(execDef);
                break;
        }
    },

    queryState: function(selectionDef, cmd) {
        return (selectionDef.anchorCount > 0);
    }
});

/**
 * Placeholder object for explicitly removing an attribute
 */
CQ.form.rte.commands.Link.REMOVE_ATTRIBUTE = new Object();

//register command
CQ.form.rte.commands.CommandRegistry.register("extendedlink", CQ.form.rte.commands.ExtendedLink);


/**
 * @class CQ.form.rte.plugins.ExtendedLinkPlugin
 * @extends CQ.form.rte.plugins.Plugin
 * <p>This class implements links as a plugin.</p>
 * <p>The plugin ID is "<b>extendedlinks</b>".</p>
 * <p><b>Features</b></p>
 * <ul>
 *   <li><b>modifylink</b> - adds a button to create and modify links</li>
 *   <li><b>unlink</b> - adds a button to remove existing links</li>
 * </ul>
 * <p><b>Additional config requirements (CQ 5.2)</b></p>
 * <p>Plugin configuration has not been moved to the respective plugin completely yet.
 * Therefore, the following plugin-specific settings must currently (CQ 5.2) be configured
 * through the corresponding {@link CQ.form.RichText} widget:</p>
 * <ul>
 *   <li>The dialog that is used to create and modify links must be configured using
 *     {@link CQ.form.RichText#linkbrowseConfig}.</li>
 * </ul>
 */
CQ.form.rte.plugins.ExtendedLinkPlugin = CQ.Ext.extend(CQ.form.rte.plugins.Plugin, {

    /**
     * @cfg {Boolean} trimLinkSelection
     * True if leading and trailing whitespace should removed from the selection (not from
     * the actual text/content!) before creating a new link (defaults to true).
     * @since 5.3
     */

    /**
     * @cfg {Object} linkDialogConfig
     * @since 5.3
     */

    /**
     * @cfg {Object} anchorDialogConfig
     * Configuration of the anchor dialog (defaults to { }). You may specify the same
     * config options as for {@link CQ.Dialog}. Note that the default value
     * of null implies using a default dialog.
     * @since 5.3
     */

    /**
     * @private
     */
    linkDialog: null,

    /**
     * @private
     */
    linkUI: null,

    /**
     * @private
     */
    removeLinkUI: null,

    constructor: function(editorKernel) {
        CQ.form.rte.plugins.ExtendedLinkPlugin.superclass.constructor.call(this, editorKernel);
    },

    getFeatures: function() {
        return [ "modifylink", "unlink" ];
    },

    /**
     * Creates a link using the internal link dialog.
     * @private
     */
    modifyLink: function(context) {
        if (!this.linkDialog || this.linkDialog.isDestroyed) {
        	var pagePath = CQ.WCM.getPagePath().replace("/cf#", "");
            var editorKernel = this.editorKernel;
            var defaultConfig = {
                "title" : CQ.I18n.getMessage("Hyperlink"),
                "modal" : true,
                "width" : 500,
                "height" : 320,
                "xtype" : "dialog",
                "buttons" : CQ.Dialog.OKCANCEL,
                "resetValues" : function() {
                	this.getField("./internallink").setValue("");
                	this.getField("./deeplinkParam").setValue("");
                	this.getField("./externallink").setValue("");
                	this.getField("./disclaimerlink").setValue("");
                	this.getField("./glossaryLink").setValue("");
                	this.getField("./linkTitle").setValue("");
                	this.getField("./inPageLink").setValue("");
                	this.getField("./link_behavior").setValue("");
                	//this.getField("./link_params").setValue("");
                },
                "setLink" : function(a) {
                	this.getField("./internallink").setValue(a.dom.getAttribute('internallink'));
                	this.getField("./deeplinkParam").setValue(a.dom.getAttribute('deeplinkparam'));
                	this.getField("./externallink").setValue(a.dom.getAttribute('externallink'));
                	this.getField("./disclaimerlink").setValue(a.dom.getAttribute('disclaimerlink'));
                	this.getField("./glossaryLink").setValue(a.dom.getAttribute('glossarylink'));
                	this.getField("./linkTitle").setValue(a.dom.getAttribute('title'));
                	this.getField("./inPageLink").setValue(a.dom.getAttribute('inpagelink'));
                	this.getField("./link_behavior").setValue(a.dom.getAttribute('linkbehavior'));
                	//this.getField("./link_params").setValue(a.dom.getAttribute('linkparams'));
                },
                "ok" : function() {
                	this.linkDialog.hide();
                    if (CQ.Ext.isIE) {
                        this.savedRange.select();
                    }
                    this.editorKernel.relayCmd("modifylink", {
                        "url" : "#",
                        "attributes" : {
                            "title" : this.linkDialog.getField("./linkTitle").getValue(),
                            "internallink" : this.linkDialog.getField("./internallink").getValue(),
                            "disclaimerlink" : this.linkDialog.getField("./disclaimerlink").getValue(),
                            "externallink" : this.linkDialog.getField("./externallink").getValue(),
                            "glossarylink" : this.linkDialog.getField("./glossaryLink").getValue(),
                            "deeplinkparam" : this.linkDialog.getField("./deeplinkParam").getValue(),
                            "inpagelink" : this.linkDialog.getField("./inPageLink").getValue(),
                            "linkbehavior" : this.linkDialog.getField("./link_behavior").getValue()
                            //"linkparams" : this.linkDialog.getField("./link_params")
                        }
                    });
                }.createDelegate(this),
                items : {
                    xtype : 'tabpanel',
                    title : 'link',
                    items : [{
                        title : 'link_tablabel',
                        xtype : 'panel',
                        items : [{
                                fieldDescription : 'linktitle_desc',
                                fieldLabel : 'linktitle_label',
                                name : './linkTitle',
                                xtype : 'textfield'
                        },{
	                        fieldLabel : 'internallink_label',
	                        name : './internallink',
	                        listeners : {
	                        	change : function(field, newVal, oldVal) {
	                        		gmdsGetDeepLinkOpts().setNewDeepLinkParam(field, newVal);
	                        		gmdsGetParameterizedLinkOpts().setInternalLink(newVal);
	                        		gmdsInPageOpts().setLinks(field, newVal);
	                        	},
	                        	dialogselect : function(field, path, anchor) {
	                        		gmdsGetDeepLinkOpts().setNewDeepLinkParam(field, field.getValue());
	                        		gmdsGetParameterizedLinkOpts().setInternalLink(field.getValue());
	                        		gmdsInPageOpts().setLinks(field, field.getValue());
	                        	}
	                        },
	                        xtype : 'pathfield'
                        }, {
                        	fieldLabel : 'deeplink_param_label',
                        	fieldDescription : 'deeplink_param_desc',
                        	name : './deeplinkParam',
                        	options : [{
                        		text : '- No deeplink targets available -',
                        		value : ''
                        	}],
                        	type : 'select',
                        	xtype : 'selection'
                        }, {
                        	fieldLabel : 'inpagelink_label',
                        	name : './inPageLink',
                        	options : [{
                        		text : '- No in page links available -',
                        		value : ''
                        	}],
                        	type : 'select',
                        	xtype : 'selection'
                        }, {
                            fieldDescription : 'disclaimerlink_desc',
                            fieldLabel : 'disclaimerlink_label',
                            name : './disclaimerlink',
                            options : pagePath + '.all-disclaimers.json',
                            type : 'select',
                            xtype : 'selection'
                        }, {
                        	fieldDescription : 'glossarylink_desc',
                    		fieldLabel : 'glossarylink_label',
                    		name : './glossaryLink',
                    		options : pagePath + '.all-glossary-items.json',
                    		type : 'select',
                    		xtype : 'selection'
                        }, {
                        	fieldDescription : 'externallink_desc',
                            fieldLabel : 'externallink_label',
                            name : './externallink',
                            xtype : 'browsefield'
                        }, {
                        	defaultValue : 'default',
                            fieldDescription : 'link_behavior_desc',
                            fieldLabel : 'link_behavior_label',
                            name : './link_behavior',
                            options : pagePath + '.link-behavior-configurations.json',
                            type : 'select',
                            xtype : 'selection'
                        }/*
                        , {
                        	fieldDescription : 'link_params_desc',
                            fieldLabel : 'link_params_label',
                            itemDialog : '/apps/gmds/components/core/dialog/snippets/parameterizedlinkparams.infinity.json',
                            itemDialogNameProperty : 'parameterized',
                            name : './link_params',
                            orderable : false,
                            xtype : 'extendedmultifield',
                            fieldConfig : {
                            	orderable : false,
                            	xtype : 'textfield'
                            },
                            listeners : {
                            	afterlayout : function(container, layout) {
                            		gmdsGetParameterizedLinkOpts().getInternalLink(container, './internallink');
                            	}
                            }
                        }*/]
                    }]
                }
            };

            this.linkDialog = CQ.Util.build(defaultConfig);
            this.linkDialog.getField('./deeplinkParam').setOptions(gmdsGetDeepLinkOpts().getDeepLinkParam(this.linkDialog.getField('./deeplinkParam'), './internallink'));
            this.linkDialog.getField('./inPageLink').setOptions(gmdsInPageOpts().getLinks(null, false));
        } else {
            this.linkDialog.resetValues();
        }
        var selectionDef = this.editorKernel.analyzeSelection();
        if (selectionDef.anchorCount == 1) {
            this.linkDialog.setLink(selectionDef.anchors[0]);
        }
        if (CQ.Ext.isIE) {
            this.savedRange = context.doc.selection.createRange();
        }
        this.linkDialog.show();
        window.setTimeout( function() {
            this.linkDialog.toFront();
        }.createDelegate(this), 10);
    },

    applyLink: function(context) {
        var linkObj = this.linkDialog.objToEdit;
        if (linkObj) {
            var linkUrl = linkObj.href;
            var cssClass = linkObj.cssClass;
            var target = linkObj.target;
            if (CQ.Ext.isIE) {
                this.savedRange.select();
            }
            this.editorKernel.relayCmd("modifylink", {
                "url": linkUrl,
                "css": cssClass,
                "target": target,
                "trimLinkSelection": this.config.trimLinkSelection,
                "attributes": linkObj.attributes
            });
        }
    },

    initializeUI: function(tbGenerator) {
        var plg = CQ.form.rte.plugins;
        var ui = CQ.form.rte.ui;
        if (this.isFeatureEnabled("modifylink")) {
            this.linkUI = new ui.TbElement("modifylink", this, false,
                    this.getTooltip("modifylink"));
            tbGenerator.addElement("links", plg.Plugin.SORT_LINKS, this.linkUI, 10);
        }
        if (this.isFeatureEnabled("unlink")) {
            this.removeLinkUI = new ui.TbElement("unlink", this, false,
                    this.getTooltip("unlink"));
            tbGenerator.addElement("links", plg.Plugin.SORT_LINKS, this.removeLinkUI, 20);
        }
    },

    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        CQ.Util.applyDefaults(pluginConfig, {
            "features": "*",
            "trimLinkSelection": true,
            "linkDialogConfig": {
                "targetConfig": {
                    "mode": "manual"
                }
            },
            "anchorDialogConfig": {
                // empty by default
            },
            "tooltips": {
                "modifylink": {
                    "title": CQ.I18n.getMessage("Hyperlink"),
                    "text": CQ.I18n.getMessage("Create or modify a hyperlink.")
                },
                "unlink": {
                    "title": CQ.I18n.getMessage("Unlink"),
                    "text": CQ.I18n.getMessage("Remove an existing hyperlink from the selected text.")
                }
            }
        });
        this.config = pluginConfig;
    },

    execute: function(cmd, value, env) {
        if (cmd == "modifylink") {
            this.modifyLink(env.editContext);
        } else {
            this.editorKernel.relayCmd(cmd);
        }
    },

    updateState: function(selDef) {
        var hasSingleAnchor = selDef.anchorCount == 1;
        var hasNoAnchor = selDef.anchorCount == 0;
        var selectedNode = selDef.selectedDom;
        var isLinkableObject = false;
        if (selectedNode) {
            isLinkableObject = CQ.form.rte.Common.isTag(selectedNode,
                    CQ.form.rte.plugins.LinkPlugin.LINKABLE_OBJECTS);
        }
        var isCreateLinkEnabled = hasSingleAnchor
                || ((selDef.isSelection || isLinkableObject) && hasNoAnchor);
        if (this.linkUI) {
            this.linkUI.getExtUI().setDisabled(!isCreateLinkEnabled);
        }
        if (this.removeLinkUI) {
            this.removeLinkUI.getExtUI().setDisabled(!hasSingleAnchor);
        }
    }

});

/**
 * Array with tag names that define objects (like images) that are linkable when selected
 * @private
 * @static
 * @final
 * @type String[]
 */
CQ.form.rte.plugins.LinkPlugin.LINKABLE_OBJECTS = [
    "img"
];


// register plugin
CQ.form.rte.plugins.PluginRegistry.register("extendedlinks", CQ.form.rte.plugins.ExtendedLinkPlugin);

/**
 * @class CQ.form.rte.plugins.ExtendedLinkPlugin
 * @extends CQ.form.rte.plugins.Plugin
 * <p>This class implements links as a plugin.</p>
 * <p>The plugin ID is "<b>extendedlinks</b>".</p>
 * <p><b>Features</b></p>
 * <ul>
 *   <li><b>modifylink</b> - adds a button to create and modify links</li>
 *   <li><b>unlink</b> - adds a button to remove existing links</li>
 * </ul>
 * <p><b>Additional config requirements (CQ 5.2)</b></p>
 * <p>Plugin configuration has not been moved to the respective plugin completely yet.
 * Therefore, the following plugin-specific settings must currently (CQ 5.2) be configured
 * through the corresponding {@link CQ.form.RichText} widget:</p>
 * <ul>
 *   <li>The dialog that is used to create and modify links must be configured using
 *     {@link CQ.form.RichText#linkbrowseConfig}.</li>
 * </ul>
 */
CQ.form.rte.plugins.ExtendedLinkPlugin = CQ.Ext.extend(CQ.form.rte.plugins.Plugin, {

    /**
     * @cfg {Boolean} trimLinkSelection
     * True if leading and trailing whitespace should removed from the selection (not from
     * the actual text/content!) before creating a new link (defaults to true).
     * @since 5.3
     */

    /**
     * @cfg {Object} linkDialogConfig
     * @since 5.3
     */

    /**
     * @cfg {Object} anchorDialogConfig
     * Configuration of the anchor dialog (defaults to { }). You may specify the same
     * config options as for {@link CQ.Dialog}. Note that the default value
     * of null implies using a default dialog.
     * @since 5.3
     */

    /**
     * @private
     */
    linkDialog: null,

    /**
     * @private
     */
    linkUI: null,

    /**
     * @private
     */
    removeLinkUI: null,

    constructor: function(editorKernel) {
        CQ.form.rte.plugins.LinkPlugin.superclass.constructor.call(this, editorKernel);
    },

    getFeatures: function() {
        return [ "modifylink", "unlink" ];
    },

    /**
     * Creates a link using the internal link dialog.
     * @private
     */
    modifyLink: function(context) {
        if (!this.linkDialog || this.linkDialog.isDestroyed) {
        	var pagePath = CQ.WCM.getPagePath().replace("/cf#", "");
            var editorKernel = this.editorKernel;
            var defaultConfig = {
                "title" : CQ.I18n.getMessage("Hyperlink"),
                "modal" : true,
                "width" : 500,
                "height" : 320,
                "xtype" : "dialog",
                "buttons" : CQ.Dialog.OKCANCEL,
                "resetValues" : function() {
                	this.getField("./internallink").setValue("");
                	this.getField("./linkTitle").setValue("");
                },
                "setLink" : function(a) {
                	this.getField("./internallink").setValue(a.dom.getAttribute('internallink'));
                	this.getField("./linkTitle").setValue(a.dom.getAttribute('title'));
                },
                "ok" : function() {
                	this.linkDialog.hide();
                    if (CQ.Ext.isIE) {
                        this.savedRange.select();
                    }
                    this.editorKernel.relayCmd("modifylink", {
                        "url" : "#",
                        "attributes" : {
                            "title" : this.linkDialog.getField("./linkTitle").getValue(),
                            "internallink" : this.linkDialog.getField("./internallink").getValue()
                        }
                    });
                }.createDelegate(this),
                items : {
                    xtype : 'tabpanel',
                    title : 'link',
                    items : [{
                        title : 'link_tablabel',
                        xtype : 'panel',
                        items : [{
                                fieldDescription : 'linktitle_desc',
                                fieldLabel : 'linktitle_label',
                                name : './linkTitle',
                                xtype : 'textfield'
                        },{
	                        fieldLabel : 'internallink_label',
	                        name : './internallink',
	                        listeners : {
	                        	change : function(field, newVal, oldVal) {
	                        		
	                        	},
	                        	dialogselect : function(field, path, anchor) {
	                        		
	                        	}
	                        },
	                        xtype : 'pathfield'
                        }]
                    }]
                }
            };

            this.linkDialog = CQ.Util.build(defaultConfig);
        } else {
            this.linkDialog.resetValues();
        }
        var selectionDef = this.editorKernel.analyzeSelection();
        if (selectionDef.anchorCount == 1) {
            this.linkDialog.setLink(selectionDef.anchors[0]);
        }
        if (CQ.Ext.isIE) {
            this.savedRange = context.doc.selection.createRange();
        }
        this.linkDialog.show();
        window.setTimeout( function() {
            this.linkDialog.toFront();
        }.createDelegate(this), 10);
    },

    applyLink: function(context) {
        var linkObj = this.linkDialog.objToEdit;
        if (linkObj) {
            var linkUrl = linkObj.href;
            var cssClass = linkObj.cssClass;
            var target = linkObj.target;
            if (CQ.Ext.isIE) {
                this.savedRange.select();
            }
            this.editorKernel.relayCmd("modifylink", {
                "url": linkUrl,
                "css": cssClass,
                "target": target,
                "trimLinkSelection": this.config.trimLinkSelection,
                "attributes": linkObj.attributes
            });
        }
    },

    initializeUI: function(tbGenerator) {
        var plg = CQ.form.rte.plugins;
        var ui = CQ.form.rte.ui;
        if (this.isFeatureEnabled("modifylink")) {
            this.linkUI = new ui.TbElement("modifylink", this, false,
                    this.getTooltip("modifylink"));
            tbGenerator.addElement("links", plg.Plugin.SORT_LINKS, this.linkUI, 10);
        }
        if (this.isFeatureEnabled("unlink")) {
            this.removeLinkUI = new ui.TbElement("unlink", this, false,
                    this.getTooltip("unlink"));
            tbGenerator.addElement("links", plg.Plugin.SORT_LINKS, this.removeLinkUI, 20);
        }
    },

    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        CQ.Util.applyDefaults(pluginConfig, {
            "features": "*",
            "trimLinkSelection": true,
            "linkDialogConfig": {
                "targetConfig": {
                    "mode": "manual"
                }
            },
            "anchorDialogConfig": {
                // empty by default
            },
            "tooltips": {
                "modifylink": {
                    "title": CQ.I18n.getMessage("Hyperlink"),
                    "text": CQ.I18n.getMessage("Create or modify a hyperlink.")
                },
                "unlink": {
                    "title": CQ.I18n.getMessage("Unlink"),
                    "text": CQ.I18n.getMessage("Remove an existing hyperlink from the selected text.")
                }
            }
        });
        this.config = pluginConfig;
    },

    execute: function(cmd, value, env) {
        if (cmd == "modifylink") {
            this.modifyLink(env.editContext);
        } else {
            this.editorKernel.relayCmd(cmd);
        }
    },

    updateState: function(selDef) {
        var hasSingleAnchor = selDef.anchorCount == 1;
        var hasNoAnchor = selDef.anchorCount == 0;
        var selectedNode = selDef.selectedDom;
        var isLinkableObject = false;
        if (selectedNode) {
            isLinkableObject = CQ.form.rte.Common.isTag(selectedNode,
                    CQ.form.rte.plugins.LinkPlugin.LINKABLE_OBJECTS);
        }
        var isCreateLinkEnabled = hasSingleAnchor
                || ((selDef.isSelection || isLinkableObject) && hasNoAnchor);
        if (this.linkUI) {
            this.linkUI.getExtUI().setDisabled(!isCreateLinkEnabled);
        }
        if (this.removeLinkUI) {
            this.removeLinkUI.getExtUI().setDisabled(!hasSingleAnchor);
        }
    }

});

/**
 * Array with tag names that define objects (like images) that are linkable when selected
 * @private
 * @static
 * @final
 * @type String[]
 */
CQ.form.rte.plugins.LinkPlugin.LINKABLE_OBJECTS = [
    "img"
];


// register plugin
CQ.form.rte.plugins.PluginRegistry.register("pcuiExtendedlinks", CQ.form.rte.plugins.ExtendedLinkPlugin);

/**
 * @author ewiesenhuetter
 */
CQ.form.ExtendedMultifield = CQ.Ext.extend(CQ.form.CompositeField, {

    fieldConfig: null,
    
    itemDialog:null,
    
    itemDialogNameProperty: null,
    
    constructor: function(config) {
        var list = this;

        this.itemDialog = config.itemDialog;
        this.itemDialogNameProperty = config.itemDialogNameProperty;
        var items = new Array();
        var detailDialog = null;
        
        items.push({
            "xtype":"button",
            "cls": "cq-multifield-btn",
            "text":CQ.I18n.getMessage("+"),
            "handler":function() {
				var editDialogConfig = CQ.utils.WCM.getDialogConfig(list.itemDialog);
				editDialogConfig.modal = true;
				
	            detailDialog = CQ.WCM.getDialog(editDialogConfig);
	            
	            var nameProperty = detailDialog.form.findField("./" + list.itemDialogNameProperty);
	            if (nameProperty) {
	            	// has an optionsCallback
	            	if (typeof nameProperty.ownerCt.optionsCallback === "function") {
	                    try {
	                        eval(nameProperty.ownerCt.optionsCallback).call(nameProperty.ownerCt, null, {});
	                    } catch (e) {}
	                }
	            }
	            detailDialog.ok = function() {
	            	if (nameProperty) {
	            		list.addItem(nameProperty.getValue());  	            		
	            	}
	            	detailDialog.hide();
	            };
	            detailDialog.show();
            }
        });
        
        items.push({
            "xtype":"hidden",
            "name":config.name + CQ.Sling.DELETE_SUFFIX
        });
        
        if (!config.fieldConfig) {
            config.fieldConfig = {};
        }
        if (!config.fieldConfig.xtype) {
            config.fieldConfig.xtype = "textfield";
        }
        config.fieldConfig.name = config.name;
        config.fieldConfig.style = "width:95%;";

        config = CQ.Util.applyDefaults(config, {
            "defaults":{
                "xtype":"extendedmultifielditem",
                "fieldConfig":config.fieldConfig
            },
            "items":[
                { 
                    "xtype":"panel",
                    "border":false,
                    "bodyStyle":"padding:4px",
                    "items":items
                }
            ]
        });
        CQ.form.ExtendedMultifield.superclass.constructor.call(this,config);
        
        this.addEvents("change");
    },
    
    /**
     * Adds a new field to the widget.
     * @param value The value of the field
     */
    addItem: function(value) {
    	if (value && value.length > 0) {
	        var item = this.insert(this.items.getCount() - 1, {});
	        this.findParentByType("form").getForm().add(item.field);
	        this.doLayout();        
	        item.setValue(value);
    	}
    },
    
    /**
     * Returns the data value.
     * @return {String[]} value The field value
     */
    getValue: function() {
        var value = new Array();
        this.items.each(function(item, index/*, length*/) {
            if (item instanceof CQ.form.ExtendedMultifield.Item) {
                value[index] = item.getValue();
                index++;
            }
        }, this);
        return value;
    },

    /**
     * Sets a data value into the field and validates it.
     * @param {Mixed} value The value to set
     */
    setValue: function(value) {
        this.fireEvent("change", this, value, this.getValue());
    	var oldItems = this.items;
        oldItems.each(function(item/*, index, length*/) {
            if (item instanceof CQ.form.ExtendedMultifield.Item) {
                this.remove(item, true);
                this.findParentByType("form").getForm().remove(item);
            }
        }, this);
        this.doLayout();
        if ((value != null) && (value != "")) {
            if (value instanceof Array || CQ.Ext.isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    this.addItem(value[i]);
                }
            } else {
            	this.addItem(value);
            }
        }
    }
});
CQ.Ext.reg("extendedmultifield", CQ.form.ExtendedMultifield);

CQ.form.ExtendedMultifield.Item = CQ.Ext.extend(CQ.Ext.Panel, {	

    constructor: function(config) {
        var item = this;       
        this.field = CQ.Util.build(config.fieldConfig, true);
        
        var items = new Array();

        items.push({
            "xtype":"panel",
            "border":false,
            "cellCls":"cq-multifield-itemct",
            "items":item.field
        });     
       
        items.push({
            "xtype":"panel",
            "border":false,
            "items":{
                "xtype":"button",
                "text":"Up",
                "handler":function() {
                    var parent = item.ownerCt;
                    var index = parent.items.indexOf(item);

                    if (index > 0) {
                        item.reorder(parent.items.itemAt(index - 1));
                    }
                }
            }
        });
        
        items.push({
            "xtype":"panel",
            "border":false,
            "items":{
                "xtype":"button",
                "text":"Down",
                "handler":function() {
                    var parent = item.ownerCt;
                    var index = parent.items.indexOf(item);

                    if (index < parent.items.getCount() - 1) {
                        item.reorder(parent.items.itemAt(index + 1));
                    }
                }
            }
        });
        
        items.push({
            "xtype":"panel",
            "border":false,
            "items":{
                "xtype":"button",
                "cls": "cq-multifield-btn",
                "text":"-",
                "handler":function() {
                    item.ownerCt.remove(item);
                }
            }
        });
        
        config = CQ.Util.applyDefaults(config, {
            "layout":"table",
            "anchor":"100%",
            "border":false,
            "layoutConfig":{
                "columns":4
            },
            "defaults":{
                "bodyStyle":"padding:3px"
            },
            "items":items
        });
        CQ.form.ExtendedMultifield.Item.superclass.constructor.call(this, config);
        
        if (config.value) {
            this.field.setValue(config.value);
        }   
    },
    
    /**
     * Reorders the item above the specified item.
     * @param item The item to reorder above
     */
    reorder: function(item) {
        var value = item.field.getValue();
        item.field.setValue(this.field.getValue());
        this.field.setValue(value);
    },

    /**
     * Returns the data value.
     * @return {String} value The field value
     */
    getValue: function() {
        return this.field.getValue();
    },

    /**
     * Sets a data value into the field and validates it.
     * @param {String} value The value to set
     */
    setValue: function(value) {
        this.field.setValue(value);
    }    
});
CQ.Ext.reg("extendedmultifielditem", CQ.form.ExtendedMultifield.Item);
/**
 * @class CQ.form.MultiTextField
 * @extends CQ.form.CompositeField
 * This is a custom widget based on {@link CQ.form.CompositeField}.
 * @constructor
 * Creates a new CustomWidget.
 * @param {Object} config The config object
 */
CQ.form.MultiTextField = CQ.Ext.extend(CQ.form.CompositeField, {

    /**
     * @private
     * @type CQ.Ext.form.TextField
     */
    hiddenField: null,

    /**
     * @private
     * @type Array(CQ.Ext.form.TextField)
     */
    fields: [],
    
    constructor: function(config) {
        config = config || { };
        var defaults = {
            "border": false
        };
        this.config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.MultiTextField.superclass.constructor.call(this, this.config);
    },

    // overriding CQ.Ext.Component#initComponent
    initComponent: function() {
        CQ.form.MultiTextField.superclass.initComponent.call(this);

        this.hiddenField = new CQ.Ext.form.Hidden({
            name: this.name
        });
        this.add(this.hiddenField);
        
        this.fields = [];
        var numFields = this.config.numFields ? parseInt(this.config.numFields, 10) : 0;
        for (var i=0; i<numFields; i++) {
        	var field = new CQ.Ext.form.TextField({
        		hideLabel: true,
        		required: true,
        		style: {
        			width: '95%'
        		},
                listeners: {
                    change: {
                        scope:this,
                        fn:this.updateHidden
                    }
                }
            });
        	this.fields.push(field);
            this.add(field);
            if (this.config['label'+i]) {
            	var label = new CQ.Static({
            		text: CQ.I18n.getMessage(this.config['label'+i]),
            		small: true,
            		style: {
            			marginBottom: '10px'
            		}
            	})
            	this.add(label);
            	
            }
        }

    },

    // overriding CQ.form.CompositeField#processPath
    processPath: function(path) {
        for (var i=0; i<this.fields.length; i++) {
        	this.fields[i].processPath(path);
    	}
    },

    // overriding CQ.form.CompositeField#processRecord
    processRecord: function(record, path) {
        for (var i=0; i<this.fields.length; i++) {
        	this.fields[i].processRecord(record, path);
    	}
    },

    // overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
        var parts = value.split("|");
        var j=0;
        for (var i=0; i<parts.length; i++) {
        	if ((parts[i][parts[i].length-1] === '\\')&&(parts.length > i+1)) {
        		parts[i+1] = parts[i] + '|' + parts[i+1];
        	} else {
	        	if (j < this.fields.length) {
	        		this.fields[j].setValue(parts[i].replace(/\\\|/g, '|'));
	        		j += 1;
	        	}
        	}
        }
        this.hiddenField.setValue(value);
    },

    // overriding CQ.form.CompositeField#getValue
    getValue: function() {
        return this.getRawValue();
    },

    // overriding CQ.form.CompositeField#getRawValue
    getRawValue: function() {
        if (this.fields.length === 0) {
            return null;
        }
        var values = [];
        for (var i=0; i<this.fields.length; i++) {
        	values[i] = this.fields[i].getValue() ? this.fields[i].getValue() : '';
        	values[i] = values[i].replace(/\|/g, '\\|');
        }
        return values.join('|');
    },

    // private
    updateHidden: function() {
        this.hiddenField.setValue(this.getValue());
    }

});

// register xtype
CQ.Ext.reg('multitextfield', CQ.form.MultiTextField);

/**
 * The <code>Namics.GenericSortableMultiGrid</code> class represents an editable list
 * of form fields for editing multi value properties.
 * 
 * @author chauzenberger@namics.com, lstuker Namics AG
 * @class CQ.form.GenericSortableMultiGrid
 * @extends CQ.form.CompositeField
 */
CQ.form.GenericSortableMultiGrid = CQ.Ext.extend(CQ.form.CompositeField, {

    /**
     * @cfg {Object} fieldConfig
     * The configuration options for the fields (optional).
     */
    fieldConfig: null,
        
    /**
    * @cfg {String} itemStorageNode
    * Defines the crx node name that should be used to store the list entries.
    */       
    itemStorageNode: null,
    
    /**
     * @cfg {String} storeName
     * Name of the remote datastore.
     * Corresponds to the sling.servlet.selectors value of a servlet.
     */       
    storeName: null,
    
    /**
     * @cfg {String} currentCrxPath
     * Current crx path where the dialog data is stored.
     */
    currentCrxPath: null,

    /**
     * @cfg {Object} dialog
     * Dialog that contains the grid widget.
     */
    dialog: null,
    
    /**
     * @cfg {String} grid
     * Grid widget.
     */
    grid: null,
    
    /**
     * @cfg {String} editorType
     * Editor type used for editing grid values.
     * Default is textfield, richtext is supported too.
     */
    editorType: null,
    
    /**
     * @cfg {String} checkBoxPosition
     * Tells whether the checkbox is rendered as first or last cell of a row.
     * Default is first, last is supported too.
     */
    checkBoxPosition: null,
    
    /**
     * @cfg {Boolean} storeName
     * Flag for disabling the display of the move up / move down buttons.
     * Default is false.
     */
    disableMoveButtons: false,
    
    /**
     * @cfg {String} storeName
     * Additional query parameter string that will be sent to the remote store when
     * reading data..
     */
    queryParams: null,
    
    /**
     * @cfg {Boolean} allOptions
     * Flag for enabling an "All Options" checkbox which allows the selection and
     * unselection of all items.
     * Default is false.
     */
    allOptions: false,

    /**
     * @cfg {String} storeName
     * Name of the row id that is assigned to the "All Options" row.
     */
    allOptionsId: '__meta_all__',
    
    
    /**
     * Creates a new <code>CQ.form.GenericSortableMultiGrid</code>.
     * @constructor
     * @param {Object} config The config object
     */
    constructor: function (config) {
        var genericSortableMultiGrid = this;

        this.itemStorageNode = config.name;
        this.storeName = config.storeName;
        this.editorType = config.EditorType;
        this.checkBoxPosition = config.checkBoxPosition;
        this.queryParams = config.queryParams;
        this.disableMoveButtons = this.getBooleanValue(config.disableMoveButtons);
        this.allOptions = this.getBooleanValue(config.allOptions);

        var that = this;
        var items = [];
        
        // create the Grid
        this.grid = new CQ.form.GenericSortableMultiGridPanel({
            viewConfig: {
                forceFit: true
            },
            store: new CQ.Ext.data.Store({widget: that }),
            colModel: new CQ.Ext.grid.ColumnModel({ }),
            height: 350,
            autoHeight: true,
            loadMask: true
        });
        this.grid.allOptions = this.allOptions;
        
        items.push(this.grid); 
        
        config = CQ.Util.applyDefaults(config, {
            "items": items,
            "layout": {
                "type": "fit"
            }
        });
        
        
        CQ.form.GenericSortableMultiGrid.superclass.constructor.call(this, config);
        
        var parentDialog = this.findParentByType('dialog');
        parentDialog.on("beforesubmit", function (e) {
            if (that.grid.activeEditor !== null) {
                that.grid.activeEditor.completeEdit(false);
            }
            that.submitStore(that.grid.store);
        });
        parentDialog.on("hide", function (e) {
            that.grid.activeEditor = null;
        });
    },
    
    // private
    /**
     * Initializes <code>CQ.form.GenericSortableMultiGrid</code>.
     * Registers the event handlers.
     */
    initComponent: function () {
        CQ.form.CompositeField.superclass.initComponent.call(this);
        this.addEvents(CQ.form.Selection.EVENT_SELECTION_CHANGED);
    },            
    
    /**
     * Returns a boolean value for a either a boolean or a String.
     * True is returned if the value is the boolean true or the String "true".
     * 
     * @param boolean or string value
     * @returns true or false
     */
    getBooleanValue: function (value) {
        if (value && (value === true || value === "true")) {
            return true;
        } else {
            return false;
        }
    },
    
    /**
     * Submits the store and posts the grid data back to the store.
     * 
     * @param store store containing data
     */
    submitStore : function (store) {
        var allOptionsChecked = false;
        var json = {rows: []};
        var items = store.data.items;
        for (var i = 0; i < items.length; i++) {
            if (items[i].data.id === '__all__') {
                allOptionsChecked = items[i].data.selected ? true : false;
            } else {
                json.rows.push(items[i].data);
            }
        }
        json.allOptionsChecked = allOptionsChecked;
        var jsonString = CQ.Ext.encode(json);
        
        var storeUrl = this.currentCrxPath + "." + this.storeName + ".json";
        var params = {
            storage_node: this.itemStorageNode, 
            json: jsonString, 
            '_charset_': 'utf-8'
        };
        CQ.HTTP.post(storeUrl, function (options, success, response) {}, params, null, true);
        return true;
    },
    
 
    /**
     * Reads the data from the remote store and reconfigures the grid.
     */
    updateStoreData: function () {
        var that = this;
        if (this.currentCrxPath) {
	        var storeUrl = this.currentCrxPath + "." + this.storeName + ".json?storage_node=" + this.itemStorageNode;
	        if (this.queryParams) {
	            storeUrl += '&' + this.queryParams;
	        }
	        CQ.HTTP.get(storeUrl, function (options, success, response) {
	            if (success) {
	                var data = CQ.HTTP.eval(response);
	          
	                // update column model
	                var columnReader = new CQ.Ext.data.JsonReader({
	                    idProperty: 'id',
	                    root: 'columns',
	                    fields: [
	                        {name: 'title', mapping: 'title'},
	                        {name: 'id', mapping: 'id'},
	                        {name: 'editable', mapping: 'editable'}
	                    ]
	                });
	                var columns = columnReader.readRecords(data).records;
	                var columnArray = new Array(columns.length);
	          
	                var index = 0;
	                var checkModel = new CQ.Ext.grid.CheckColumn({id:'selected', dataIndex: 'selected', width: 25});
	                checkModel.init(that);
	                if (!(that.checkBoxPosition == "last")){
	                    columnArray[index] = checkModel;
	                    index++;
	                }
	                columnArray[index] = {id:'id', header: '#', dataIndex: 'id', width: 50, hidden: true};
	                index++;
	          
	                var firstDataRowIndex = index;
	                that.grid.setFirstDataRowIndex(index);
	          
	                for (var i = 0; i < columns.length; i++){
	                    columnArray[index] = {
	                        id: columns[i].get('id'), 
	                        header: columns[i].get('title'), 
	                        dataIndex: columns[i].get('id'),
	                        width: 100,
	                        fixed: false
	                    };
	                    if (columns[i].get('editable')){
	                        columnArray[index].editor = new CQ.Ext.form.TextField();
	                        columnArray[index].css = "border: 1px #cccccc solid;";  
	                    }
	                    if (columns[i].get('editable') && that.editorType == "richtext"){
	                        var richtextConfig = {
	                            rtePlugins: {
	                                edit: {defaultPasteMode : "plaintext", features: [], stripHtmlTags: true},
	                                format: {features: ["bold", "italic"]},
	                                extendedlinks: {features: ["modifylink","unlink"]},
	                                justify: {features: []},
	                                lists: {features: []},
	                                links: {features: []},
	                                subsuperscript: {features: ["superscript"]}
	                            },
	                            height: 100
	                        };
	                        var rte = new CQ.form.RichText(richtextConfig);
	                        columnArray[index].editor = rte;
	                        columnArray[index].css += "height: 100px; padding: 0;";
	                    }
	                    index ++;
	                }
	                if (that.checkBoxPosition == "last"){
	                    columnArray[index] = checkModel;
	                    index++;
	                }
	                if (!that.disableMoveButtons) {
	                    columnArray[index] = {id: 'move', header: 'Move', dataIndex: 'move', align: 'center', renderer: that.renderMoveButton, width: 100};
	                }
	                columnArray.push({id:'disabled', header: '', dataIndex: 'disabled', width: 0, hidden: true});
	                that.grid.colModel.destroy();
	                that.grid.colModel = new CQ.Ext.grid.ColumnModel({
	                    columns: columnArray,
	                    defaults: {
	                        sortable: false,
	                        resizable: false, 
	                        menuDisabled: true,
	                        fixed: true
	                    }
	                });
	          
	                // update store model
	                var fieldArray = new Array(); 
	                fieldArray[0] = "id";
	                index = 1;
	                for (var i = 0; i < columns.length; i++){
	                    fieldArray[index] = columns[i].get('id');
	                    index++;
	                }
	          
	                fieldArray[index] = "selected";
	                if (!that.disableMoveButtons) {
	                    fieldArray[index+1] = {name: "move", defaultvalue: undefined};
	                }
	                fieldArray.push({name: 'disabled', defaultValue: false});
	          
	                that.grid.store.destroy();
	                that.grid.store = new CQ.Ext.data.Store({
	                    reader: new CQ.Ext.data.JsonReader({
	                        idProperty: 'id',
	                        root: 'rows',
	                        fields: fieldArray
	                    }),
	                    widget: that
	                });
	          
	          
	                // load data into the store
	                if (that.allOptions) {
	                    var allOptionsData = {
	                        id: '__all__',
	                        selected: data.allOptionsChecked ? true : false
	                    } 
	                    allOptionsData[columnArray[firstDataRowIndex].id] = CQ.I18n.getMessage('all_options');
	                    data.rows.unshift(allOptionsData);
	                }
	                that.grid.store.loadData(data);
	          
	                // reconfigure grid
	                that.grid.reconfigure(that.grid.store,that.grid.colModel);
	            }
	        });
        }
    },
    
    /**
     * Method that is called if a dialog record is processed.
     * Saves the current crx path and updates the store.
     * 
     * @param record current record
     * @param path current crx path
     */
    processRecord: function (record, path) {
        if( path.substring(path.length - 1) !== '/' && path.substring(path.length - 1) !== '*' ) {
              this.currentCrxPath = path;
              this.updateStoreData();
        }
    },
    
    /**
     * Renders the move up / move down buttons of a grid record.
     * 
     * @param value current record value
     * @param id row id
     * @param r current record
     */
    renderMoveButton: function (value, id, r) {
        var renderContainer = function (value, id, record, mode) {
            var moveMode = mode;
            var currentRecord = record;
            var store = currentRecord.store;
            var minMoveUpIndex = store.widget.allOptions ? 1 : 0;
            var but = new CQ.Ext.Button({
                text: value,
                handler : function (btn, e) {
                    var currentIndex = store.indexOf(currentRecord);
                    if (moveMode == 'UP') {
                        if (currentIndex > minMoveUpIndex) {
                            var item = store.getAt(currentIndex);
                            store.removeAt(currentIndex);
                            store.insert(currentIndex-1,item);
                        }
                    } else {
                        if (currentIndex < currentRecord.store.data.items.length-1) {
                            var item = store.getAt(currentIndex);
                            store.removeAt(currentIndex);
                            store.insert(currentIndex+1,item);
                        }
                    }
                }
            });
        
            but.render(CQ.Ext.getBody(), id);
            
            if (store.widget.grid.activeEditor != null){
                store.widget.grid.activeEditor.completeEdit(false);
            }
            
        };
        var idUp = CQ.Ext.id();
        var idDown = CQ.Ext.id();
        window.setTimeout(function () {renderContainer('up', idUp, r, 'UP');}, 1);
        window.setTimeout(function () {renderContainer('down', idDown, r, 'DOWN');}, 1);
        return('<div style="float:left"><span id="' + idUp + '"></span></div><div style="float:left; margin-left: 5px;"><span id="' + idDown + '"></span></div>');
    },
    
    /**
     * Resets the store data and rests the grid values.
     * 
     * @param noOfDefaults the default number of records selected
     */
    resetStoreData: function (noOfDefaults) {
        var checkModel = new CQ.Ext.grid.CheckColumn({id:'selected', dataIndex: 'selected', width: 25});
        checkModel.init(this);
        checkModel.resetOptions(0, noOfDefaults);
    }
});

CQ.Ext.reg("genericsortablemultigrid", CQ.form.GenericSortableMultiGrid);

/**
 * The <code>CQ.Ext.grid.CheckColumn</code> class represents a grid column
 * that contains a checkbox.
 * 
 * @author chauzenberger@namics.com
 * @class CQ.Ext.grid.CheckColumn
 */
CQ.Ext.grid.CheckColumn = function (config){
    CQ.Ext.apply(this, config);
    if(!this.id){
        this.id = CQ.Ext.id();
    }
    this.renderer = this.renderer.createDelegate(this);
};


CQ.Ext.grid.CheckColumn.prototype = {

	/**
	 * Initializes the <code>CQ.Ext.grid.CheckColumn</code>.
	 * 
	 * @param widget <code>CQ.form.GenericSortableMultiGrid</code> widget containing the check column
	 */
    init : function (widget){
        this.widget = widget;
        this.grid = widget.grid;
        this.grid.on('reconfigure', function (){
            var view = this.grid.getView();
            var key = this.id + this.widget.itemStorageNode;
            if (!view.hasRegisteredHandler(key)) {
            	view.handlerRegistered = true;
            	view.registerHandler(key);
                view.mainBody.on('mousedown', this.onMouseDown, this);
            }
            for (var i=0; i<this.grid.store.data.length; i++) {
                var editEvent = this.getEditEvent(i);
                this.widget.fireEvent(CQ.form.Selection.EVENT_SELECTION_CHANGED, editEvent, editEvent.value);
            }
            if (this.grid.store.data.length > 0) {
            	this.checkAllOptions(0, this.grid.store.getAt(0));
            }
        }, this);
    },
    
    /**
     * Returns an edit event that is triggered for changes on the record at given index.
     * 
     * @param index index of the record that was changed
     */
    getEditEvent: function (index) {
        var record = this.grid.store.getAt(index);
        return {
            widget: this.widget,
            grid: this.grid,
            record: record,
            field: this.dataIndex,
            value: record.data[this.dataIndex],
            originalValue: record.data[this.dataIndex],
            row: index,
            column: this.grid.getColumnModel().findColumnIndex(this.dataIndex)
        };
    },

    /**
     * Handles a MouseDown event on a grid row.
     * 
     * @param e mouse down event
     * @param t affected row
     */
    onMouseDown: function (e, t){
        var index = this.grid.getView().findRowIndex(t);
        var record = this.grid.store.getAt(index);
        if(t.className && t.className.indexOf('x-grid3-cc-'+this.id) != -1 && !record.data.disabled){
            e.stopEvent();
            record.set(this.dataIndex, !record.data[this.dataIndex]);
            var editEvent = this.getEditEvent(index);
            this.grid.fireEvent('afteredit',editEvent);
            this.widget.fireEvent(CQ.form.Selection.EVENT_SELECTION_CHANGED, editEvent, editEvent.value);
            this.checkAllOptions(index, record);
            this.uncheckAllOptions(index,record);
        }
    },
    
    /**
     * Checks all checkboxes in the grid.
     * 
     * @param index index of the row where the checkbox was changed
     * @param record record of the grid where the checkbox was changed
     */
    checkAllOptions: function (index, record) {
    	if (this.grid.allOptions) {
        	if (index == 0 && record.data[this.dataIndex]) {
	        	for (var i=1; i<this.grid.store.data.length; i++) {
	        		var otherRecord = this.grid.store.getAt(i);
	        		if (!otherRecord.data.disabled) {
	        			otherRecord.set(this.dataIndex, true);
	        		}
	        	}
        	} 
        	else if (index > 0 && !record.data[this.dataIndex]) {
        		var allRecord = this.grid.store.getAt(0);
        		allRecord.set(this.dataIndex, false);
        	}
        }
    },
    
    /**
     * Unchecks all checkboxes in the grid.
     * 
     * @param index index of the row where the checkbox was changed
     * @param record record of the grid where the checkbox was changed
     */
    uncheckAllOptions: function (index, record) {
    	if (this.grid.allOptions) {
    		if (index == 0 && !record.data[this.dataIndex]){
        		for (var i=1; i<this.grid.store.data.length; i++) {
	        		var otherRecord = this.grid.store.getAt(i);
	        		if (!otherRecord.data.disabled) {
	        			otherRecord.set(this.dataIndex, false);
	        		}
	        	}
        	}
        }
    },
    
    /**
     * Resets all checkboxes in the grid with the default number of records selected.
     * 
     * @param index index of the row where the checkbox was changed
     * @param noOfDefaults the default number of records selected
     */
    resetOptions: function (index, noOfDefaults) {
    	var record = this.grid.store.getAt(index);
    	if (this.grid.store.data.length > 0) {
    		if (index == 0 && !record.data[this.dataIndex]){
        		for (var i=0; i<this.grid.store.data.length; i++) {
	        		var otherRecord = this.grid.store.getAt(i);	        		
	        		if (!otherRecord.data.disabled) {
	        			if (i < (noOfDefaults)) {
	        				otherRecord.set(this.dataIndex, true);
		        		}
	        			else{
		        			otherRecord.set(this.dataIndex, false);
		        		}
	        		}
	        	}
        	}
        }
    },

    /**
     * Renders the checkbox.
     * 
     * @param v value
     * @param p checkbox cell
     * @param record record that is rendered
     */
    renderer : function (v, p, record){
        p.css += ' x-grid3-check-col-td'; 
        if (record.data.disabled){
            record.data.selected = false;
            p.css += ' x-item-disabled ';
        }
        return '<div class="x-grid3-check-col'+(v?'-on':'')+' x-grid3-cc-'+this.id+'"></div>';
    }
};

/**
 * The <code>CQ.form.GenericSortableMultiGridPanel</code> represents the panel holding
 * the CQ.form.GenericSortableMultiGrid.
 * 
 * @author chauzenberger@namics.com
 * @class CQ.form.GenericSortableMultiGridPanel
 */
CQ.form.GenericSortableMultiGridPanel = CQ.Ext.extend(CQ.Ext.grid.EditorGridPanel, {
	
	allOptions: false,
	firstDataRowIndex: 0,
	
	/**
     * Returns the grid's GridView object.
     * @return {CQ.Ext.grid.GridView} The grid view
     */
    getView : function (){
        if(!this.view){
            this.view = new CQ.form.GenericSortableMultiGridView(this.viewConfig);
            this.view.allOptions = this.allOptions;
        }
        return this.view;
    },
    
    /**
     * Event handler for a double click on a cell.
     * Suppresses editing if text in the "All Options" row is double clicked.
     */
    onCellDblClick : function (g, row, col){
    	if (!this.allOptions || row > 0) {
    		this.startEditing(row, col);
    	}
    },
    
    /**
     * Sets the first data row of the grid.
     * The first data row is row #0 or - in case that an "All Options" row exists - 
     * row #1.
     */
    setFirstDataRowIndex: function (index) {
    	this.firstDataRowIndex = index;
    	this.getView().firstDataRowIndex = index;
    }
});

/**
 * The <code>CQ.form.GenericSortableMultiGridView</code> represents the view of 
 * the CQ.form.GenericSortableMultiGrid.
 * 
 * @author chauzenberger@namics.com
 * @class CQ.form.GenericSortableMultiGridView
 */
CQ.form.GenericSortableMultiGridView = CQ.Ext.extend(CQ.Ext.grid.GridView, {
	
	allOptions: false,
	firstDataRowIndex: 0,
	registeredHandlers: [],
	
	registerHandler : function (handlerID) {
		this.registeredHandlers.push(handlerID);
	},
	
	hasRegisteredHandler : function (handlerID) {
		for (var i = 0; i < this.registeredHandlers.length; i++)
			if (this.registeredHandlers[i] == handlerID)
				return true;
		
		return false;
	},
	
	/**
	 * Renders the <code>CQ.form.GenericSortableMultiGridView</code>.
	 * Contains special styles for rendering the "All Options" row.
	 */
	doRender : function (cs, rs, ds, startRow, colCount, stripe){
        var ts = this.templates, ct = ts.cell, rt = ts.row, last = colCount-1;
        var tstyle = 'width:'+this.getTotalWidth()+';';
        // buffers
        var buf = [], cb, c, p = {}, rp = {tstyle: tstyle}, r;
        for(var j = 0, len = rs.length; j < len; j++){
            r = rs[j]; cb = [];
            var rowIndex = (j+startRow);
            for(var i = 0; i < colCount; i++){
                c = cs[i];
                p.id = c.id;
                p.css = i === 0 ? 'x-grid3-cell-first ' : (i == last ? 'x-grid3-cell-last ' : '');
                p.attr = p.cellAttr = '';
	            p.value = c.renderer.call(c.scope, r.data[c.name], p, r, rowIndex, i, ds);
	            p.style = c.style;
	            if (this.allOptions && rowIndex == 0){
                	p.style += "border-bottom: 1px black solid; height: 25px;";
	            }
	            if (this.allOptions && rowIndex == 0 && i > this.firstDataRowIndex && c.id !== 'selected') {
                	p.value = '';
                	p.style = p.style.replace("border: 1px #cccccc solid;", "border: 0px;");
                }
                if(CQ.Ext.isEmpty(p.value)){
                    p.value = '&#160;';
                }
                if(this.markDirty && r.dirty && CQ.Ext.isDefined(r.modified[c.name])){
                    p.css += ' x-grid3-dirty-cell';
                }
                cb[cb.length] = ct.apply(p);
            }
            var alt = [];
            if(stripe && ((rowIndex+1) % 2 === 0)){
                alt[0] = 'x-grid3-row-alt';
            }
            if(r.dirty){
                alt[1] = ' x-grid3-dirty-row';
            }
            rp.cols = colCount;
            if(this.getRowClass){
                alt[2] = this.getRowClass(r, rowIndex, rp, ds);
            }
            rp.alt = alt.join(' ');
            rp.cells = cb.join('');
            buf[buf.length] =  rt.apply(rp);
        }
        return buf.join('');
    }
    
});


/**
 * The <code>Namics.GenericSortableConfigMultiGrid</code> class represents an editable list
 * of form fields for editing multi value properties.
 * 
 * @author chauzenberger@namics.com, lstuker Namics AG
 * @class CQ.form.GenericSortableConfigMultiGrid
 * @extends CQ.form.CompositeField
 */
CQ.form.GenericSortableConfigMultiGrid = CQ.Ext.extend(CQ.form.CompositeField, {

    /**
     * @cfg {Object} fieldConfig
     * The configuration options for the fields (optional).
     */
    fieldConfig: null,
        
    /**
    * @cfg {String} itemStorageNode
    * Defines the crx node name that should be used to store the list entries.
    */       
    itemStorageNode: null,
    
    /**
     * @cfg {String} storeName
     * Name of the remote datastore.
     * Corresponds to the sling.servlet.selectors value of a servlet.
     */       
    storeName: null,
    
    /**
     * @cfg {String} currentCrxPath
     * Current crx path where the dialog data is stored.
     */
    currentCrxPath: null,

    /**
     * @cfg {Object} dialog
     * Dialog that contains the grid widget.
     */
    dialog: null,
    
    /**
     * @cfg {String} grid
     * Grid widget.
     */
    grid: null,
    
    /**
     * @cfg {String} editorType
     * Editor type used for editing grid values.
     * Default is textfield, richtext is supported too.
     */
    editorType: null,
    
    /**
     * @cfg {String} checkBoxPosition
     * Tells whether the checkbox is rendered as first or last cell of a row.
     * Default is first, last is supported too.
     */
    checkBoxPosition: null,
    
    /**
     * @cfg {Boolean} storeName
     * Flag for disabling the display of the move up / move down buttons.
     * Default is false.
     */
    disableMoveButtons: false,
    
    disableAlterTitle: false,
    
    /**
     * @cfg {String} storeName
     * Additional query parameter string that will be sent to the remote store when
     * reading data..
     */
    queryParams: null,
    
    /**
     * @cfg {Boolean} allOptions
     * Flag for enabling an "All Options" checkbox which allows the selection and
     * unselection of all items.
     * Default is false.
     */
    allOptions: false,

    /**
     * @cfg {String} storeName
     * Name of the row id that is assigned to the "All Options" row.
     */
    allOptionsId: '__meta_all__',
    
    
    /**
     * Creates a new <code>CQ.form.GenericSortableConfigMultiGrid</code>.
     * @constructor
     * @param {Object} config The config object
     */
    constructor: function (config) {
        var genericSortableConfigMultiGrid = this;

        this.itemStorageNode = config.name;
        this.storeName = config.storeName;
        this.editorType = config.EditorType;
        this.checkBoxPosition = config.checkBoxPosition;
        this.queryParams = config.queryParams;
        this.disableMoveButtons = this.getBooleanValue(config.disableMoveButtons);
        this.allOptions = this.getBooleanValue(config.allOptions);

        var that = this;
        var items = [];
        
        // create the Grid
        this.grid = new CQ.form.GenericSortableConfigMultiGridPanel({
            viewConfig: {
                forceFit: true
            },
            store: new CQ.Ext.data.Store({widget: that }),
            colModel: new CQ.Ext.grid.ColumnModel({ }),
            height: 350,
            autoHeight: true,
            loadMask: true
        });
        this.grid.allOptions = this.allOptions;
        
        items.push(this.grid); 
        
        config = CQ.Util.applyDefaults(config, {
            "items": items,
            "layout": {
                "type": "fit"
            }
        });
        
        
        CQ.form.GenericSortableConfigMultiGrid.superclass.constructor.call(this, config);
        
        var parentDialog = this.findParentByType('dialog');
        parentDialog.on("beforesubmit", function (e) {
            if (that.grid.activeEditor !== null) {
                that.grid.activeEditor.completeEdit(false);
            }
            that.submitStore(that.grid.store);
        });
        parentDialog.on("hide", function (e) {
            that.grid.activeEditor = null;
        });
    },
    
    // private
    /**
     * Initializes <code>CQ.form.GenericSortableConfigMultiGrid</code>.
     * Registers the event handlers.
     */
    initComponent: function () {
        CQ.form.CompositeField.superclass.initComponent.call(this);
        this.addEvents(CQ.form.Selection.EVENT_SELECTION_CHANGED);
    },            
    
    /**
     * Returns a boolean value for a either a boolean or a String.
     * True is returned if the value is the boolean true or the String "true".
     * 
     * @param boolean or string value
     * @returns true or false
     */
    getBooleanValue: function (value) {
        if (value && (value === true || value === "true")) {
            return true;
        } else {
            return false;
        }
    },
    
    /**
     * Submits the store and posts the grid data back to the store.
     * 
     * @param store store containing data
     */
    submitStore : function (store) {
        var allOptionsChecked = false;
        var json = {rows: []};
        var items = store.data.items;
        for (var i = 0; i < items.length; i++) {
            if (items[i].data.id === '__all__') {
                allOptionsChecked = items[i].data.selected ? true : false;
            } else {
                json.rows.push(items[i].data);
            }
        }
        json.allOptionsChecked = allOptionsChecked;
        var jsonString = CQ.Ext.encode(json);
        
        var storeUrl = this.currentCrxPath + "." + this.storeName + ".json";
        var params = {
            storage_node: this.itemStorageNode, 
            json: jsonString, 
            '_charset_': 'utf-8'
        };
        CQ.HTTP.post(storeUrl, function (options, success, response) {}, params, null, true);
        return true;
    },
    
 
    /**
     * Reads the data from the remote store and reconfigures the grid.
     */
    updateStoreData: function () {
        var that = this;
        if (this.currentCrxPath) {
	        var storeUrl = this.currentCrxPath + "." + this.storeName + ".json?storage_node=" + this.itemStorageNode;
	        if (this.queryParams) {
	            storeUrl += '&' + this.queryParams;
	        }
	        CQ.HTTP.get(storeUrl, function (options, success, response) {
	            if (success) {
	                var data = CQ.HTTP.eval(response);
	          
	                // update column model
	                var columnReader = new CQ.Ext.data.JsonReader({
	                    idProperty: 'id',
	                    root: 'columns',
	                    fields: [
	                        {name: 'title', mapping: 'title'},
	                        {name: 'id', mapping: 'id'},                     
	                        {name: 'editable', mapping: 'editable'}
	                    ]
	                });
	                var columns = columnReader.readRecords(data).records;
	                var columnArray = new Array(columns.length);
	          
	                var index = 0;
	                var checkModel = new CQ.Ext.grid.CheckColumn({id:'selected', dataIndex: 'selected', width: 25});
	                checkModel.init(that);
	                if (!(that.checkBoxPosition == "last")){
	                    columnArray[index] = checkModel;
	                    index++;
	                }
	                columnArray[index] = {id:'id', header: '#', dataIndex: 'id', width: 50, hidden: true};
	                index++;
	          
	                var firstDataRowIndex = index;
	                that.grid.setFirstDataRowIndex(index);
	          
	                for (var i = 0; i < columns.length; i++){
	                    columnArray[index] = {
	                        id: columns[i].get('id'), 
	                        header: columns[i].get('title'), 
	                        dataIndex: columns[i].get('id'),
	                        width: 100,
	                        fixed: false
	                    };
	                    if (columns[i].get('editable')){
	                        columnArray[index].editor = new CQ.Ext.form.TextField();
	                        columnArray[index].css = "border: 1px #cccccc solid;";  
	                    }
	                    
	                    if (columns[i].get('editable') && that.editorType == "richtext"){
	                        var richtextConfig = {
	                            rtePlugins: {
	                                edit: {defaultPasteMode : "plaintext", features: [], stripHtmlTags: true},
	                                format: {features: ["bold", "italic"]},
	                                extendedlinks: {features: ["modifylink","unlink"]},
	                                justify: {features: []},
	                                lists: {features: []},
	                                links: {features: []},
	                                subsuperscript: {features: ["superscript"]}
	                            },
	                            height: 100
	                        };
	                        var rte = new CQ.form.RichText(richtextConfig);
	                        columnArray[index].editor = rte;
	                        columnArray[index].css += "height: 100px; padding: 0;";
	                    }
	                    index ++;
	                }
	                
	            
	               
	                
	                if (that.checkBoxPosition == "last"){
	                    columnArray[index] = checkModel;
	                    index++;
	                }
	                if (!that.disableMoveButtons) {
	                    columnArray[index] = {id: 'move', header: 'Move', dataIndex: 'move', align: 'center', renderer: that.renderMoveButton, width: 100};
	                }
	                columnArray.push({id:'disabled', header: '', dataIndex: 'disabled', width: 0, hidden: true});
	                that.grid.colModel.destroy();
	                that.grid.colModel = new CQ.Ext.grid.ColumnModel({
	                    columns: columnArray,
	                    defaults: {
	                        sortable: false,
	                        resizable: false, 
	                        menuDisabled: true,
	                        fixed: true
	                    }
	                });

	                // update store model
	                var fieldArray = new Array(); 
	                fieldArray[0] = "id";
	                index = 1;
	                for (var i = 0; i < columns.length; i++){
	                    fieldArray[index] = columns[i].get('id');
	                    index++;
	                }
	             
	               
	                fieldArray[index] = "selected";
	                if (!that.disableMoveButtons) {
	                    fieldArray[index+1] = {name: "move", defaultvalue: undefined};
	                }
	                fieldArray.push({name: 'disabled', defaultValue: false});
	          
	                that.grid.store.destroy();
	                that.grid.store = new CQ.Ext.data.Store({
	                    reader: new CQ.Ext.data.JsonReader({
	                        idProperty: 'id',
	                        root: 'rows',
	                        fields: fieldArray
	                    }),
	                    widget: that
	                });
	          
	          
	                // load data into the store
	                if (that.allOptions) {
	                    var allOptionsData = {
	                        id: '__all__',
	                        selected: data.allOptionsChecked ? true : false
	                    } 
	                    allOptionsData[columnArray[firstDataRowIndex].id] = CQ.I18n.getMessage('all_options');
	                    data.rows.unshift(allOptionsData);
	                }
	                that.grid.store.loadData(data);
	          
	                // reconfigure grid
	                that.grid.reconfigure(that.grid.store,that.grid.colModel);
	            }
	        });
        }
    },
    
    /**
     * Method that is called if a dialog record is processed.
     * Saves the current crx path and updates the store.
     * 
     * @param record current record
     * @param path current crx path
     */
    processRecord: function (record, path) {
        if( path.substring(path.length - 1) !== '/' && path.substring(path.length - 1) !== '*' ) {
              this.currentCrxPath = path;
              this.updateStoreData();
        }
    },
    
    /**
     * Renders the move up / move down buttons of a grid record.
     * 
     * @param value current record value
     * @param id row id
     * @param r current record
     */
    renderMoveButton: function (value, id, r) {
        var renderContainer = function (value, id, record, mode) {
            var moveMode = mode;
            var currentRecord = record;
            var store = currentRecord.store;
            var minMoveUpIndex = store.widget.allOptions ? 1 : 0;
            var but = new CQ.Ext.Button({
                text: value,
                handler : function (btn, e) {
                    var currentIndex = store.indexOf(currentRecord);
                    if (moveMode == 'UP') {
                        if (currentIndex > minMoveUpIndex) {
                            var item = store.getAt(currentIndex);
                            store.removeAt(currentIndex);
                            store.insert(currentIndex-1,item);
                        }
                    } else {
                        if (currentIndex < currentRecord.store.data.items.length-1) {
                            var item = store.getAt(currentIndex);
                            store.removeAt(currentIndex);
                            store.insert(currentIndex+1,item);
                        }
                    }
                }
            });
        
            but.render(CQ.Ext.getBody(), id);
            
            if (store.widget.grid.activeEditor != null){
                store.widget.grid.activeEditor.completeEdit(false);
            }
            
        };
        var idUp = CQ.Ext.id();
        var idDown = CQ.Ext.id();
        window.setTimeout(function () {renderContainer('up', idUp, r, 'UP');}, 1);
        window.setTimeout(function () {renderContainer('down', idDown, r, 'DOWN');}, 1);
        return('<div style="float:left"><span id="' + idUp + '"></span></div><div style="float:left; margin-left: 5px;"><span id="' + idDown + '"></span></div>');
    },
    
    /**
     * Resets the store data and rests the grid values.
     * 
     * @param noOfDefaults the default number of records selected
     */
    resetStoreData: function (noOfDefaults) {
        var checkModel = new CQ.Ext.grid.CheckColumn({id:'selected', dataIndex: 'selected', width: 25});
        checkModel.init(this);
        checkModel.resetOptions(0, noOfDefaults);
    }
});

CQ.Ext.reg("genericsortableconfigmultigrid", CQ.form.GenericSortableConfigMultiGrid);

/**
 * The <code>CQ.Ext.grid.CheckColumn</code> class represents a grid column
 * that contains a checkbox.
 * 
 * @author chauzenberger@namics.com
 * @class CQ.Ext.grid.CheckColumn
 */
CQ.Ext.grid.CheckColumn = function (config){
    CQ.Ext.apply(this, config);
    if(!this.id){
        this.id = CQ.Ext.id();
    }
    this.renderer = this.renderer.createDelegate(this);
};


CQ.Ext.grid.CheckColumn.prototype = {

	/**
	 * Initializes the <code>CQ.Ext.grid.CheckColumn</code>.
	 * 
	 * @param widget <code>CQ.form.GenericSortableConfigMultiGrid</code> widget containing the check column
	 */
    init : function (widget){
        this.widget = widget;
        this.grid = widget.grid;
        this.grid.on('reconfigure', function (){
            var view = this.grid.getView();
            var key = this.id + this.widget.itemStorageNode;
            if (!view.hasRegisteredHandler(key)) {
            	view.handlerRegistered = true;
            	view.registerHandler(key);
                view.mainBody.on('mousedown', this.onMouseDown, this);
            }
            for (var i=0; i<this.grid.store.data.length; i++) {
                var editEvent = this.getEditEvent(i);
                this.widget.fireEvent(CQ.form.Selection.EVENT_SELECTION_CHANGED, editEvent, editEvent.value);
            }
            if (this.grid.store.data.length > 0) {
            	this.checkAllOptions(0, this.grid.store.getAt(0));
            }
        }, this);
    },
    
    /**
     * Returns an edit event that is triggered for changes on the record at given index.
     * 
     * @param index index of the record that was changed
     */
    getEditEvent: function (index) {
        var record = this.grid.store.getAt(index);
        return {
            widget: this.widget,
            grid: this.grid,
            record: record,
            field: this.dataIndex,
            value: record.data[this.dataIndex],
            originalValue: record.data[this.dataIndex],
            row: index,
            column: this.grid.getColumnModel().findColumnIndex(this.dataIndex)
        };
    },

    /**
     * Handles a MouseDown event on a grid row.
     * 
     * @param e mouse down event
     * @param t affected row
     */
    onMouseDown: function (e, t){
        var index = this.grid.getView().findRowIndex(t);
        var record = this.grid.store.getAt(index);
        if(t.className && t.className.indexOf('x-grid3-cc-'+this.id) != -1 && !record.data.disabled){
            e.stopEvent();
            record.set(this.dataIndex, !record.data[this.dataIndex]);
            var editEvent = this.getEditEvent(index);
            this.grid.fireEvent('afteredit',editEvent);
            this.widget.fireEvent(CQ.form.Selection.EVENT_SELECTION_CHANGED, editEvent, editEvent.value);
            this.checkAllOptions(index, record);
            this.uncheckAllOptions(index,record);
        }
    },
    
    /**
     * Checks all checkboxes in the grid.
     * 
     * @param index index of the row where the checkbox was changed
     * @param record record of the grid where the checkbox was changed
     */
    checkAllOptions: function (index, record) {
    	if (this.grid.allOptions) {
        	if (index == 0 && record.data[this.dataIndex]) {
	        	for (var i=1; i<this.grid.store.data.length; i++) {
	        		var otherRecord = this.grid.store.getAt(i);
	        		if (!otherRecord.data.disabled) {
	        			otherRecord.set(this.dataIndex, true);
	        		}
	        	}
        	} 
        	else if (index > 0 && !record.data[this.dataIndex]) {
        		var allRecord = this.grid.store.getAt(0);
        		allRecord.set(this.dataIndex, false);
        	}
        }
    },
    
    /**
     * Unchecks all checkboxes in the grid.
     * 
     * @param index index of the row where the checkbox was changed
     * @param record record of the grid where the checkbox was changed
     */
    uncheckAllOptions: function (index, record) {
    	if (this.grid.allOptions) {
    		if (index == 0 && !record.data[this.dataIndex]){
        		for (var i=1; i<this.grid.store.data.length; i++) {
	        		var otherRecord = this.grid.store.getAt(i);
	        		if (!otherRecord.data.disabled) {
	        			otherRecord.set(this.dataIndex, false);
	        		}
	        	}
        	}
        }
    },
    
    /**
     * Resets all checkboxes in the grid with the default number of records selected.
     * 
     * @param index index of the row where the checkbox was changed
     * @param noOfDefaults the default number of records selected
     */
    resetOptions: function (index, noOfDefaults) {
    	var record = this.grid.store.getAt(index);
    	if (this.grid.store.data.length > 0) {
    		if (index == 0 && !record.data[this.dataIndex]){
        		for (var i=0; i<this.grid.store.data.length; i++) {
	        		var otherRecord = this.grid.store.getAt(i);	        		
	        		if (!otherRecord.data.disabled) {
	        			if (i < (noOfDefaults)) {
	        				otherRecord.set(this.dataIndex, true);
		        		}
	        			else{
		        			otherRecord.set(this.dataIndex, false);
		        		}
	        		}
	        	}
        	}
        }
    },

    /**
     * Renders the checkbox.
     * 
     * @param v value
     * @param p checkbox cell
     * @param record record that is rendered
     */
    renderer : function (v, p, record){
        p.css += ' x-grid3-check-col-td'; 
        if (record.data.disabled){
            record.data.selected = false;
            p.css += ' x-item-disabled ';
        }
        return '<div class="x-grid3-check-col'+(v?'-on':'')+' x-grid3-cc-'+this.id+'"></div>';
    }
};

/**
 * The <code>CQ.form.GenericSortableConfigMultiGridPanel</code> represents the panel holding
 * the CQ.form.GenericSortableConfigMultiGrid.
 * 
 * @author chauzenberger@namics.com
 * @class CQ.form.GenericSortableConfigMultiGridPanel
 */
CQ.form.GenericSortableConfigMultiGridPanel = CQ.Ext.extend(CQ.Ext.grid.EditorGridPanel, {
	
	allOptions: false,
	firstDataRowIndex: 0,
	
	/**
     * Returns the grid's GridView object.
     * @return {CQ.Ext.grid.GridView} The grid view
     */
    getView : function (){
        if(!this.view){
            this.view = new CQ.form.GenericSortableConfigMultiGridView(this.viewConfig);
            this.view.allOptions = this.allOptions;
        }
        return this.view;
    },
    
    /**
     * Event handler for a double click on a cell.
     * Suppresses editing if text in the "All Options" row is double clicked.
     */
    onCellDblClick : function (g, row, col){
    	if (!this.allOptions || row > 0) {
    		this.startEditing(row, col);
    	}
    },
    
    /**
     * Sets the first data row of the grid.
     * The first data row is row #0 or - in case that an "All Options" row exists - 
     * row #1.
     */
    setFirstDataRowIndex: function (index) {
    	this.firstDataRowIndex = index;
    	this.getView().firstDataRowIndex = index;
    }
});

/**
 * The <code>CQ.form.GenericSortableConfigMultiGridView</code> represents the view of 
 * the CQ.form.GenericSortableConfigMultiGrid.
 * 
 * @author chauzenberger@namics.com
 * @class CQ.form.GenericSortableConfigMultiGridView
 */
CQ.form.GenericSortableConfigMultiGridView = CQ.Ext.extend(CQ.Ext.grid.GridView, {
	
	allOptions: false,
	firstDataRowIndex: 0,
	registeredHandlers: [],
	
	registerHandler : function (handlerID) {
		this.registeredHandlers.push(handlerID);
	},
	
	hasRegisteredHandler : function (handlerID) {
		for (var i = 0; i < this.registeredHandlers.length; i++)
			if (this.registeredHandlers[i] == handlerID)
				return true;
		
		return false;
	},
	
	/**
	 * Renders the <code>CQ.form.GenericSortableConfigMultiGridView</code>.
	 * Contains special styles for rendering the "All Options" row.
	 */
	doRender : function (cs, rs, ds, startRow, colCount, stripe){
        var ts = this.templates, ct = ts.cell, rt = ts.row, last = colCount-1;
        var tstyle = 'width:'+this.getTotalWidth()+';';
        // buffers
        var buf = [], cb, c, p = {}, rp = {tstyle: tstyle}, r;
        for(var j = 0, len = rs.length; j < len; j++){
            r = rs[j]; cb = [];
            var rowIndex = (j+startRow);
            for(var i = 0; i < colCount; i++){
                c = cs[i];
                p.id = c.id;
                p.css = i === 0 ? 'x-grid3-cell-first ' : (i == last ? 'x-grid3-cell-last ' : '');
                p.attr = p.cellAttr = '';
	            p.value = c.renderer.call(c.scope, r.data[c.name], p, r, rowIndex, i, ds);
	            p.style = c.style;
	            if (this.allOptions && rowIndex == 0){
                	p.style += "border-bottom: 1px black solid; height: 25px;";
	            }
	            if (this.allOptions && rowIndex == 0 && i > this.firstDataRowIndex && c.id !== 'selected') {
                	p.value = '';
                	p.style = p.style.replace("border: 1px #cccccc solid;", "border: 0px;");
                }
                if(CQ.Ext.isEmpty(p.value)){
                    p.value = '&#160;';
                }
                if(this.markDirty && r.dirty && CQ.Ext.isDefined(r.modified[c.name])){
                    p.css += ' x-grid3-dirty-cell';
                }
                cb[cb.length] = ct.apply(p);
            }
            var alt = [];
            if(stripe && ((rowIndex+1) % 2 === 0)){
                alt[0] = 'x-grid3-row-alt';
            }
            if(r.dirty){
                alt[1] = ' x-grid3-dirty-row';
            }
            rp.cols = colCount;
            if(this.getRowClass){
                alt[2] = this.getRowClass(r, rowIndex, rp, ds);
            }
            rp.alt = alt.join(' ');
            rp.cells = cb.join('');
            buf[buf.length] =  rt.apply(rp);
        }
        return buf.join('');
    }
    
});


/**
 * The <code>Namics.PageThemeSelector</code> is a widget that allows selection of page themes.
 * 
 * @author lstuker Namics AG
 * @class CQ.form.PageThemeSelector
 * @extends CQ.form.CompositeField
 */
CQ.form.PageThemeSelector = CQ.Ext.extend(CQ.form.CompositeField, {

	panel: null,
	
	store: null,
	
	isClosed: true,
	
	data: [],
	
	selectedItem: 0,
	
	hiddenField: null,
	
	fieldName: "",
	
	storePath: "",
	
	selector: "",
	
	template: null,
	
	dataView: null,
	
	items: null,
	
	constructor: function(config) {
		
		this.items = new Array();	
		this.fieldName = config.name;
		this.selector = config.selector;
		this.isClosed = true;
		
		config = CQ.Util.applyDefaults(config, {
            "items":this.items
        });
		
		
		this.template = new CQ.Ext.XTemplate(
			    '<tpl for=".">',
			    	'<tpl if="index &gt; 0">',
			        '<div class="theme-item" id="theme{name}" style="border-top: 1px #cccccc solid; height: 118px; padding-top: 5px; padding-bottom: 5px;">',
			        '</tpl>',
			        '<tpl if="index &lt; 1">',
			        '<div class="theme-item" id="theme{name}" style="border-top: 0px; height: 118px; padding-top: 5px; padding-bottom: 5px;">',
			        '</tpl>',
			        '<table><tr style="vertical-align:top"><td style="padding-left: 5px">',
			        '<div style="width: 128px; height: 115px; border: 1px #cccccc solid; overflow:hidden"><img src="{image}"/></div>',
			        '</td><td style="padding-left: 10px;">',
			        '<div style="font-weight:bold;">{name}</div>',
			        '<div style="font-style: italic;">{description}</div>',
			        '</td></tr></table>',
			        '</div>',
			        '<div style = "clear:both"></div>',
			    '</tpl>',
			    '<div class="x-clear"></div>'
			);
	
		this.store = new CQ.Ext.data.ArrayStore({
	            fields: ['index','name', 'description', 'path', 'image'],
	            idIndex: 3
	        });
		
		var that = this;
		
		this.dataView = new CQ.Ext.DataView({
	        store: that.store,
	        selectorObject: that,
	        tpl: that.template,
	        autoHeight:true,
	        autoWidth:true,
	        autoScroll:false,
	        singleSelect: true,
	        multiSelect:false,
	        overClass:'x-grid3-row-over',
	        selectedClass:'x-grid3-row-selected',
	        itemSelector:'div.theme-item',
	        emptyText: 'No content available.',
	        listeners: {
	        	click: that.toggleSelection
	        },
			renderTo: CQ.Ext.getBody()
	    });

		
		this.container = new CQ.Ext.Container({
		    id:'images-view',
		    autoScroll:true,
		    style : { height : 'auto' , 'max-height' : '200px'},
		    height:'auto',
	
		    items: this.dataView
		});
				
		
		this.items.push(this.container);
		
		this.hiddenField =  new CQ.Ext.form.Hidden({"name": this.fieldName, "value": ""});
		this.items.push(this.hiddenField);
		
		CQ.form.PageThemeSelector.superclass.constructor.call(this,config);
			
	},
	
	
	toggleSelection: function(element,index,node,e){
		if (!element.selectorObject.isClosed){
			var record = element.store.getAt(index);
			record.set("index","0");
			element.store.removeAll();
			element.store.add([record]);
			element.selectorObject.selectedItem = index;
			element.selectorObject.hiddenField.setRawValue(record.get("path"));
			element.selectorObject.isClosed = true;
		}
		else{
			element.store.removeAll();
			element.store.loadData(element.selectorObject.data);
			element.select(element.selectorObject.selectedItem);
			element.selectorObject.isClosed = false;
			
		}
		
	},
	
	getStoreData : function(value){
    	var that = this;
    	var storeUrl = this.storePath;
        CQ.HTTP.get(storeUrl, function(options, success, response) {
        	if (success) {
        		var data = CQ.HTTP.eval(response);
        		
        		var jsonReader = new CQ.Ext.data.JsonReader({
            	    idProperty: 'name',
            	    root: 'pageThemes',
            	    fields: ['name','description','path','image']
                  });
        		
        		var records = jsonReader.readRecords(data).records;
        		
        		var arrayData = [];      		
        		for (var i = 0; i < records.length; i++){
        			arrayData[i] = [i,records[i].get("name"),records[i].get("description"),records[i].get("path"),records[i].get("image")];
        		}
        		
        		that.data = arrayData;	
        		
        		// set initial store state
        		that.store.loadData(that.data);
        		var record = that.store.getById(value);
        		if (record == null){
        			record = that.store.getAt(0);
        		}
        		that.selectedItem = that.store.indexOf(record);
        		record.set("index","0");
        		that.store.removeAll();
        		that.store.add([record]);
        		that.hiddenField.setRawValue(record.get("path"));
        		that.isClosed = true;
        	}
        });
	},
	
	// overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
    	//console.log(value);
    	this.getStoreData(value);
    },
    
    
    processPath: function(path) {
    	this.storePath = path + this.selector;
    }
	
	
    
});

CQ.Ext.reg("pagethemeselector", CQ.form.PageThemeSelector);


/**
 * The <code>DynamicDisplayField</code> sets its value from another source set through the selector.
 * 
 * @author nperry Namics AG
 * @class CQ.form.DynamicDisplayField
 * @extends CQ.Ext.form.DisplayField
 */
CQ.form.DynamicDisplayField = CQ.Ext.extend(CQ.Ext.form.DisplayField, {	
	
	constructor: function(config) {
		CQ.form.DynamicDisplayField.superclass.constructor.call(this,config);
		 var dialog = this.findParentByType('dialog');
		 var that = this;
		 dialog.on( "beforeshow", function( e ) {
			 var path = dialog.path;
				
			var sourceUrl = path + "." + config.selector + ".json";
			CQ.HTTP.get(sourceUrl, function(options, success, response) {
		        if (success) {
		         var data = CQ.HTTP.eval(response);
		         if(data.length>0){
		        	 that.setValue(data[0].value); 
		         }
		        }
		      });
        });

	}
});

CQ.Ext.reg("dynamicdisplayfield", CQ.form.DynamicDisplayField);


/**
 * The <code>Namics.RichTextFontSelector</code> is a widget that allows selection of richtext styles.
 * 
 * @author lstuker Namics AG
 * @class CQ.form.RichTextFontSelector
 * @extends CQ.form.CompositeField
 */
CQ.form.RichTextFontSelector = CQ.Ext.extend(CQ.form.CompositeField, {

	store: null,
	
	template: null,
	
	dataView: null,
	
	fontSelector: null,
	
	weightSelector: null,
	
	styleSelector: null,
	
	name: "",
	
	constructor: function(config) {
		
		this.name = config.name;
		
		var that = this;
		
		var items = new Array();	
		config = CQ.Util.applyDefaults(config, {
            items: items,
            border: true      
        });
		
		this.store = new CQ.Ext.data.ArrayStore({
	            fields: ['index','name', 'color'],
	            idIndex: 3
	        });	
		
		var fontConfig = {
				type: 'select',
				width: 112,
				name: this.name + '/font',
				options: '$PATH.richtext-fonts-options.json'
			};
		
		this.fontSelector = new CQ.form.Selection(fontConfig);	

		this.fontSelector.on("loadcontent", function(f,r,p){gmdsSelectionHelper().selectFirstAsDefault(that.fontSelector);});
		
		var weightLabel = new CQ.Ext.Container({
			html: 'Weight',
			style: 'padding-right: 4px; padding-left: 8px; color:black;'
		});	
		
		var weightConfig = {
				type: 'select',
				width: 60,
				name: this.name + '/weight',
				options: [
							{
								text: '---',
								value: ''
							},
							{
								text: 'Thin',
								value: '100'
							},
							{
								text: 'Light',
								value: '200'
							},
							{
								text: 'Normal',
								value: 'normal'
							},
							{
								text: 'Bold',
								value: 'bold'
							},
							{
								text: 'Bolder',
								value: 'bolder'
							}
						]
			};

		this.weightSelector = new CQ.form.Selection(weightConfig);
		this.weightSelector.on("loadcontent", function(f,r,p){gmdsSelectionHelper().selectFirstAsDefault(that.weightSelector);});

		var styleLabel = new CQ.Ext.Container({
			html: 'Style',
			style: 'padding-right: 4px; padding-left: 8px; color: black;'
		});
		
		var styleConfig = {
				type: 'select',
				width: 60,
				name: this.name + '/style',
				options: [
							{
								text: '---',
								value: ''
							},
							{
								text: 'Normal',
								value: 'normal'
							},
							{
								text: 'Italic',
								value: 'italic'
							},
							{
								text: 'Oblique',
								value: 'oblique'
							}
						]
		};

		this.styleSelector = new CQ.form.Selection(styleConfig);
		this.styleSelector.on("loadcontent", function(f,r,p){gmdsSelectionHelper().selectFirstAsDefault(that.styleSelector);});	
	
		this.container = new CQ.Ext.Panel({
		    cls:'style-selector',
		    autoScroll:true,
		    height:'auto',
		    border: false,
		    items: [this.fontSelector, weightLabel, this.weightSelector, styleLabel, this.styleSelector],
		    renderTo: CQ.Ext.getBody(),
		    layout: {
		    	type: 'hbox',
		    	align: 'middle',
		    	padding: '0',
		    	margin: '0'
		    }
		});
				
		items.push(this.container);
		
		
		CQ.form.RichTextFontSelector.superclass.constructor.call(this,config);	
		
		// overwrite global min-width for input fields...
		jQuery('.style-selector .x-form-text').css('min-width',"0px");
		jQuery('.style-selector .x-form-item').css('margin',"0");
		jQuery('.style-selector .x-panel-body').addClass('x-toolbar');
		jQuery('.style-selector .x-panel-body').css('padding','1px');
	},
	
	
	processPath: function(path) {
		
		this.fontSelector.processPath(path);
		this.weightSelector.processPath(path);
		this.styleSelector.processPath(path);
	},
	
	processRecord: function(record, path) {
		
		this.fontSelector.processRecord(record,path);
		this.weightSelector.processRecord(record,path);
		this.styleSelector.processRecord(record,path);
	}

    
});

CQ.Ext.reg("richtextfontselector", CQ.form.RichTextFontSelector);


/**
 * The <code>Namics.RichTextColorSelector</code> is a widget that allows selection of richtext styles.
 * 
 * @author lstuker Namics AG
 * @class CQ.form.RichTextColorSelector
 * @extends CQ.form.CompositeField
 */
CQ.form.RichTextColorSelector = CQ.Ext.extend(CQ.form.CompositeField, {

	store: null,
	
	template: null,
	
	dataView: null,
	
	colorSelector: null,
	
	sizeSelector: null,
	
	name: "",
	
	constructor: function(config) {
		
		this.name = config.name;
		
		var that = this;
		
		var items = new Array();	
		config = CQ.Util.applyDefaults(config, {
            items: items,
            border: true      
        });
		
		this.store = new CQ.Ext.data.ArrayStore({
	            fields: ['index','name', 'color'],
	            idIndex: 3
	        });	
		
		var options = config.type ? '$PATH.text-colors-options.json?type=' + config.type : '$PATH.text-colors-options.json';
		var colorConfig ={
				//width: 217,
				width: 202,
				hideLabel: true,
				name: this.name + '/color',
				options: options
		};

		this.colorSelector = new CQ.form.ColorSelection(colorConfig);	
		this.colorSelector.on("loadcontent", function(f,r,p){gmdsSelectionHelper().selectFirstAsDefault(that.colorSelector);});	

		var sizeLabel = new CQ.Ext.Container({
			html: 'Size',
			style: 'padding-right: 4px; padding-left: 11px; color: black;'
		});
		
		var sizeConfig = {
			type: 'combobox',
			width: 60,
			name: this.name + '/size',
			defaultValue: '---',
			options: [
			          	{ text: '---'}, { text: '8'}, { text: '9'}, { text: '10'},
						{ text: '12'}, { text: '14'},{ text: '16'}, { text: '18'}, { text: '24'},{ text: '26'},
						{ text: '30'}, { text: '36'},{ text: '38'}, { text: '48'}, { text: '60'}
					]
		};
		this.sizeSelector = new CQ.form.Selection(sizeConfig);	
		this.sizeSelector.on("loadcontent", function(f,r,p){gmdsSelectionHelper().selectFirstAsDefault(that.sizeSelector);});	
		this.sizeSelector.comboBox.regex = /^([0-9]*|\-\-\-)$/;
	
		this.container = new CQ.Ext.Panel({
		    cls:'style-selector',
		    autoScroll:true,
		    height:'auto',
		    border: false,
		    items: [this.colorSelector, sizeLabel, this.sizeSelector],
		    renderTo: CQ.Ext.getBody(),
		    layout: {
		    	type: 'hbox',
		    	align: 'middle',
		    	padding: '0',
		    	margin: '0'
		    }
		});
				
		items.push(this.container);
		
		
		CQ.form.RichTextColorSelector.superclass.constructor.call(this,config);	
		
		// overwrite global min-width for input fields...
		jQuery('.style-selector .x-form-text').css('min-width',"0px");
		jQuery('.style-selector .x-form-item').css('margin',"0");
		jQuery('.style-selector .x-panel-body').addClass('x-toolbar');
		jQuery('.style-selector .x-panel-body').css('padding','1px');
	},
	
	
	processPath: function(path) {	

		this.colorSelector.processPath(path);
		this.sizeSelector.processPath(path);
	},
	
	processRecord: function(record, path) {
		
		this.colorSelector.processRecord(record,path);
		this.sizeSelector.processRecord(record,path);
	}
	
	

    
});

CQ.Ext.reg("richtextcolorselector", CQ.form.RichTextColorSelector);


CQ.form.ColorPicker = CQ.Ext.extend(CQ.form.CompositeField, {

	store: null,
	
	template: null,
	
	dataView: null,
	
	colorSelector: null,
	
	sizeSelector: null,
	
	name: "",
	
	constructor: function(config) {
		
		this.name = config.name;
		
		var that = this;
		
		var items = new Array();	
		config = CQ.Util.applyDefaults(config, {
            items: items,
            border: true      
        });
		
		this.store = new CQ.Ext.data.ArrayStore({
	            fields: ['index','name', 'color'],
	            idIndex: 3
	        });	
		
		var options = config.type ? '$PATH.text-colors-options.json?type=' + config.type : '$PATH.text-colors-options.json';
		var colorConfig ={
				width: 202,
				hideLabel: true,
				name: this.name,
				options: options
		};

		this.colorSelector = new CQ.form.ColorSelection(colorConfig);	
		this.colorSelector.on("loadcontent", function(f,r,p){gmdsSelectionHelper().selectFirstAsDefault(that.colorSelector);});	

		this.container = new CQ.Ext.Panel({
		    cls:'style-selector',
		    autoScroll:true,
		    height:'auto',
		    border: false,
		    items: [this.colorSelector,],
		    renderTo: CQ.Ext.getBody(),
		    layout: {
		    	type: 'hbox',
		    	align: 'middle',
		    	padding: '0',
		    	margin: '0'
		    }
		});
				
		items.push(this.container);
		
		
		CQ.form.ColorPicker.superclass.constructor.call(this,config);	
		
		// overwrite global min-width for input fields...
		jQuery('.style-selector .x-form-text').css('min-width',"0px");
		jQuery('.style-selector .x-form-item').css('margin',"0");
		jQuery('.style-selector .x-panel-body').addClass('x-toolbar');
		jQuery('.style-selector .x-panel-body').css('padding','1px');
	},
	
	
	processPath: function(path) {	

		this.colorSelector.processPath(path);
	},
	
	processRecord: function(record, path) {
		
		this.colorSelector.processRecord(record,path);
	}
	
	

    
});

CQ.Ext.reg("ColorPicker", CQ.form.ColorPicker);


/**
 * The <code>Namics.ColorSelection</code> extends the standard selection widget to display colors within a dropdowwn.
 * 
 * @author lstuker Namics AG
 * @class CQ.form.ColorSelection
 * @extends CQ.form.Selection
 */
CQ.form.ColorSelection = CQ.Ext.extend(CQ.form.Selection, {

	
	constructor: function(config) {	
		
		config.type = "select";
		
		CQ.form.ColorSelection.superclass.constructor.call(this,config);	
		
		this.comboBox.tpl = new CQ.Ext.XTemplate(
                '<tpl for=".">' +
                '<div ext:qtip="{[CQ.shared.Util.htmlEncode(values[\"qtip\"])]}" class="x-combo-list-item" style="padding:0">' +
                '<table style="width:100%; table-layout: fixed; color: #7F7F7F; "><tr style="vertical-align:top; "><td style="width:54px; vertical-align:middle;">' +
                '<tpl if="xindex &gt; 1">' +
                '<div style="cursor:pointer;width:45px; height: 15px; border: 1px black solid; background-color: {[CQ.shared.XSS.getXSSTablePropertyValue(values, \"value\")]}; margin: 2px; float: left;"></div>' +
                '</td><td style="overflow:hidden; padding-left: 4px; vertical-align:middle">' +
                '<div style="cursor:pointer; float: left;">{[CQ.shared.XSS.getXSSTablePropertyValue(values, \"text\")]}</div>' +
                '</tpl>' +
                '<tpl if="xindex &lt; 2">' +
                '<div style="cursor:pointer; width:47px; height: 17px; border: 0; margin: 2px; float: right;"></div>' +
                '</td><td style="overflow:hidden; padding-left: 4px; vertical-align:middle">' +
                '<div style="cursor:pointer; float: left; ">{[CQ.shared.XSS.getXSSTablePropertyValue(values, \"text\")]}</div>' +
                '</tpl>' +  
                '</td></tr></table>' +
                '</div>' +
            '</tpl>'
        );
	}
		
    
});

CQ.Ext.reg("colorselection", CQ.form.ColorSelection);


/**
 * The <code>Namics.ColorMultifield</code> extends the multifield widget to insert colors
 * 
 * @author lstuker Namics AG
 * @class CQ.form.ColorMulitField
 * @extends CQ.form.MultiField
 */
CQ.form.ColorMultiField = CQ.Ext.extend(CQ.form.MultiField, {

	
	constructor: function(config) {	
		
		config.title = "<table><tr><td style='width:102px'><b>Value</b></td><td><b>Name</b></td></tr></table>";
		config.headerCfg = {
				cls: "",
				style: "padding-top: 5px; padding-bottom: 5px; padding-left: 5px; border: 1px #99BBE8 solid; border-bottom: 0;",
		};
		
		config.fieldConfig = {
				xtype: "colortextfield"
		};
					
		CQ.form.ColorMultiField.superclass.constructor.call(this,config);	
		
		// correct bad aligned layout
        this.on("afterlayout", function(el){     	
        	var tables = CQ.Ext.query('.colortextfield-table .x-table-layout');
        	CQ.Ext.each(tables, function(item,index) {
        		console.log(item.firstChild.firstChild.firstChild);
        		item.style.width = '100%';
        		item.firstChild.firstChild.firstChild.style.width = '112px';
        	});    	
        });
				
	}
		
    
});

CQ.Ext.reg("colormultifield", CQ.form.ColorMultiField);

/**
 * @class CQ.form.ColorTextField
 * @extends CQ.form.CompositeField
 * This is a custom widget based on {@link CQ.form.CompositeField}.
 * @constructor
 * Creates a new CustomWidget.
 * @param {Object} config The config object
 */
CQ.form.ColorTextField = CQ.Ext.extend(CQ.form.CompositeField, {

    /**
     * @private
     * @type CQ.Ext.form.TextField
     */
    hiddenField: null,

    /**
     * @private
     * @type Array(CQ.Ext.form.TextField)
     */
    fields: [],
    
    container: null,
    
    constructor: function(config) {
        config = config || { };
        var defaults = {
            "border": false
        };
        this.config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.ColorTextField.superclass.constructor.call(this, this.config);
    },

    // overriding CQ.Ext.Component#initComponent
    initComponent: function() {
        CQ.form.ColorTextField.superclass.initComponent.call(this);

        this.hiddenField = new CQ.Ext.form.Hidden({
            name: this.name
        });
        this.add(this.hiddenField);
        
        this.fields = [];
        
        
        var valueField = new CQ.Ext.form.TextField({
    		hideLabel: true,
    		required: true,
    		allowBlank: false,
    		regex: /^[A-Fa-f0-9]{6}$/,
    		regexText: 'Only digits (0-9) and letters from A to F are allowed and it must be exact six characters.',
    		style: 'width: 91px',
            listeners: {
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        
        this.fields.push(valueField);
        
        var nameField = new CQ.Ext.form.TextField({
    		hideLabel: true,
    		required: true,
    		allowBlank: false,
    		style:'margin-left: 25px; float:right; width:100%;',
            listeners: {
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        
        this.fields.push(nameField);
        
        
        this.container = new CQ.Ext.Panel({
		    autoScroll:true,
		    height:'auto',
		    border: false,
		    items: this.fields,
		    renderTo: CQ.Ext.getBody(),
		    cls: 'colortextfield-table',
		    layout: {
		    	type: 'table',
		    }
		});
        
        this.add(this.container); 

    },

    // overriding CQ.form.CompositeField#processPath
    processPath: function(path) {
        for (var i=0; i<this.fields.length; i++) {
        	this.fields[i].processPath(path);
    	}
    },

    // overriding CQ.form.CompositeField#processRecord
    processRecord: function(record, path) {
        for (var i=0; i<this.fields.length; i++) {
        	this.fields[i].processRecord(record, path);
    	}
    },

    // overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
        var parts = value.split("|");
        var j=0;
        for (var i=0; i<parts.length; i++) {
        	if ((parts[i][parts[i].length-1] === '\\')&&(parts.length > i+1)) {
        		parts[i+1] = parts[i] + '|' + parts[i+1];
        	} else {
	        	if (j < this.fields.length) {
	        		this.fields[j].setValue(parts[i].replace(/\\\|/g, '|'));
	        		j += 1;
	        	}
        	}
        }
        this.hiddenField.setValue(value);
    },

    // overriding CQ.form.CompositeField#getValue
    getValue: function() {
        return this.getRawValue();
    },

    // overriding CQ.form.CompositeField#getRawValue
    getRawValue: function() {
        if (this.fields.length === 0) {
            return null;
        }
        var values = [];
        for (var i=0; i<this.fields.length; i++) {
        	values[i] = this.fields[i].getValue() ? this.fields[i].getValue() : '';
        	values[i] = values[i].replace(/\|/g, '\\|');
        }
        return values.join('|');
    },

    // private
    updateHidden: function() {
        this.hiddenField.setValue(this.getValue());
    }

});

// register xtype
CQ.Ext.reg('colortextfield', CQ.form.ColorTextField);

/**
 * @author ewiesenhuetter, namics (deutschland) gmbh
 * @since GMDS Release 1.4
 */
CQ.form.rte.commands.DdpSsiCommand = CQ.Ext.extend(CQ.form.rte.commands.Command, {
    
	/**
     * Creates a styled link from the current selection.
     * @private
     */
    addSsiToDom: function(execDef) {
        var context = execDef.editContext;
        var nodeList = execDef.nodeList;
        var url = execDef.value.url;
        var styleName = execDef.value.css;
        var target = execDef.value.target;
        var attributes = execDef.value.attributes || { };
        var links = [ ];
        nodeList.getAnchors(context, links, true);
        if (links.length > 0) {
            // modify existing link(s)
            for (var i = 0; i < links.length; i++) {
                this.applyLinkProperties(links[i].dom, url, styleName, target, attributes);
            }
        } else {
            // create new link
            var sel = CQ.form.rte.Selection;
            var dpr = CQ.form.rte.DomProcessor;
            if (execDef.value.trimLinkSelection === true) {
                var range = sel.getLeadRange(context);
                range = sel.trimRangeWhitespace(win, range);
                sel.selectRange(context, range);
                nodeList = dpr.createNodeList(context, sel.createProcessingSelection(context));
            }
            // handle HREF problems on IE with undo (IE will deliberately change the
            // HREF, causing the undo mechanism to fail):
            var helperSpan = context.createElement("span");
            url = url.replace(/&amp;/g, "&");                                 
            helperSpan.innerHTML = "<a href=\"" + url + "\"></a>";
            attributes.href = helperSpan.childNodes[0].href;
            attributes[CQ.form.rte.Common.HREF_ATTRIB] = url;
            if (styleName) {
                attributes.className = styleName;
            }
            if (target) {
                attributes.target = target;
            } else {
                delete attributes.target;
            }
            for (var key in attributes) {
                if (attributes.hasOwnProperty(key)) {
                    var attribValue = attributes[key];
                    if ((attribValue == null) || (attribValue.length == 0) || (attribValue == CQ.form.rte.commands.Link.REMOVE_ATTRIBUTE)) {
                        delete attributes[key];
                    }
                }
            }
            nodeList.surround(context, "a", attributes);
        }
    },

    /**
     * Applies link properties (href, style, target) to the given anchor dom element.
     * @param {HTMLElement} dom DOM element the link properties will be applied (should be
     * @param {String} url URL/href to set
     * @param {String} styleName Name of CSS class to apply
     * @param {String} target target frame of the link
     * @param {Object} addAttributes additional attributes
     * @private
     */
    applyLinkProperties: function(dom, url, styleName, target, addAttributes) {
        var com = CQ.form.rte.Common;
        dom.href = url;
        dom.setAttribute(CQ.form.rte.Common.HREF_ATTRIB, url);
        if (target) {
            com.setAttribute(dom, "target", target);
        } else {
            com.removeAttribute(dom, "target");
        }
        if (styleName) {
            com.setAttribute(dom, "class", styleName);
        } else {
            com.removeAttribute(dom, "class");
        }
        for (var attribName in addAttributes) {
            if (addAttributes.hasOwnProperty(attribName)) {
                var attribValue = addAttributes[attribName];
                if (attribValue && (attribValue.length > 0) && (attribValue != CQ.form.rte.commands.Link.REMOVE_ATTRIBUTE)) {
                    com.setAttribute(dom, attribName, attribValue);
                } else {
                    com.removeAttribute(dom, attribName);
                }
            }
        }
    },
    
    /**
     * Removes a styled ssi link according to the current selection.
     * @private
     */
    removeSsiFromDom: function(execDef) {
        var dpr = CQ.form.rte.DomProcessor;
        var context = execDef.editContext;
        var nodeList = execDef.nodeList;
        var links = [ ];
        nodeList.getAnchors(context, links, true);
        for (var i = 0; i < links.length; i++) {
            dpr.removeWithoutChildren(links[i].dom);
        }
    },

    isCommand: function(cmdStr) {
        var cmdLC = cmdStr.toLowerCase();
        return (cmdLC == "modifyddp") || (cmdLC == "removeddp");
    },

    getProcessingOptions: function() {
        var cmd = CQ.form.rte.commands.Command;
        return cmd.PO_BOOKMARK | cmd.PO_SELECTION | cmd.PO_NODELIST;
    },

    execute: function(execDef) {
        switch (execDef.command.toLowerCase()) {
            case "modifyddp":
                this.addSsiToDom(execDef);
                break;
            case "removeddp":
                this.removeSsiFromDom(execDef);
                break;
        }
    },
    
    queryState: function(selectionDef, cmd) {
        return (selectionDef.anchorCount > 0);
    }
});

//register command
CQ.form.rte.commands.CommandRegistry.register("ddpssi", CQ.form.rte.commands.DdpSsiCommand);

/**
 * @author ewiesenhuetter, namics (deutschland) gmbh
 * @since GMDS Release 1.4
 */
CQ.form.rte.plugins.DdpSsiPlugin = CQ.Ext.extend(CQ.form.rte.plugins.Plugin, {
    
    /**
     * @private
     */
    ddpSsiDialog: null,

    /**
     * @private
     */
    ddpSsiUI: null,
    
    /**
     * @private
     */
    removeDdpSsiUI: null,

    constructor: function(editorKernel) {
        CQ.form.rte.plugins.DdpSsiPlugin.superclass.constructor.call(this, editorKernel);
    },

    getFeatures: function() {
        return [ "modifyddp", "removeddp" ];
    },

    /**
     * Creates a ddp ssi statement using a dialog.
     * @private
     */
    modifyDdpSsi: function(context) {
        var _options = "[{value:\"\", text:\"- No options available -\"}]";
        _options = eval(_options);
        var _optionsOnInit = gmdsGetDdpData().getOptionsOnInit();
        if (_optionsOnInit !== undefined) {
            _options = _optionsOnInit;
        } else {
            var data = gmdsGetDdpData().getAll(gmdsGetDdpData().getComponentPath());
            if (data !== undefined) {
                _options = gmdsGetDdpData().getOptionsOnExisting(data.bsc, data.clc, data.my, data.sc, data.excelFile, data.bbcp);
            }
        }
        if (!this.ddpSsiDialog) {
            var defaultConfig = {
                "jcr:primaryType" : "cq:Dialog",
                "title" : CQ.I18n.getMessage("Option"),
                "modal" : true,
                "width" : 500,
                "height" : 320, 
                "xtype" : "dialog", 
                "buttons" : CQ.Dialog.OKCANCEL, 
                "resetValues" : function(newOptions) { 
                	this.getField("./ddpSsiStatement").setOptions(newOptions);
                },
                "setOption" : function(a) { 
                    this.getField("./ddpSsiStatement").setValue(a.dom.getAttribute('href'));
                },
                "ok" : function() {
                    this.ddpSsiDialog.hide();
                    if (CQ.Ext.isIE) {
                        this.savedRange.select();
                    }
                    this.editorKernel.relayCmd("modifyddp", {
                        "url" : this.ddpSsiDialog.getField("./ddpSsiStatement").getValue(),
                        "attributes" : {
                            "class" : "cnt_opt"
                        }
                    });
                    this.editorKernel.deferFocus();
                }.createDelegate(this),
                "items" : {
                    "jcr:primaryType" : "cq:TabPanel",
                    "xtype" : "tabpanel",
                    "items" : {
                        "jcr:primaryType" : "cq:WidgetCollection",
                        "ddpssitab" : {
                            "jcr:primaryType" : "cq:Widget",
                            "title" : "Link",
                            "xtype" : "panel",
                            "items" : {
                                "jcr:primaryType" : "cq:WidgetCollection",
                                "ddpSsiStatement" : {
                                    "jcr:primaryType" : "cq:Widget",
                                    "fieldLabel" : "Option Link",
                                    "name" : "./ddpSsiStatement",
                                    "type" : "select",
                                    "xtype" : "selection",
                                    "options" : _options
                                }
                            }
                        }
                    }
                } 
            };
            if (!this.ddpSsiDialogConfig) {
                this.ddpSsiDialogConfig = {};
            }
            CQ.Util.applyDefaults(this.ddpSsiDialogConfig,defaultConfig);
            this.ddpSsiDialog = new CQ.Util.build(this.ddpSsiDialogConfig);
        } else {
            this.ddpSsiDialog.resetValues(_options);
        }
        var selectionDef = this.editorKernel.analyzeSelection();
        if (selectionDef.anchorCount == 1) {
            this.ddpSsiDialog.setOption(selectionDef.anchors[0]);
        }        
        if (CQ.Ext.isIE) {
            this.savedRange = context.doc.selection.createRange();
        }
        this.ddpSsiDialog.show();
        window.setTimeout( function() {
            this.ddpSsiDialog.toFront();
        }.createDelegate(this), 10);
    },
    
    initializeUI: function(tbGenerator) {
        var plg = CQ.form.rte.plugins;
        var ui = CQ.form.rte.ui;
        if (this.isFeatureEnabled("modifyddp")) {
            this.ddpSsiUI = new ui.TbElement("modifyddp", this, false,
                    this.getTooltip("modifyddp"));
            tbGenerator.addElement("ddpssi", plg.Plugin.SORT_LINKS + 5, this.ddpSsiUI, 10);
        }
        if (this.isFeatureEnabled("removeddp")) {
            this.removeDdpSsiUI = new ui.TbElement("removeddp", this, false,
                    this.getTooltip("removeddp"));
            tbGenerator.addElement("ddpssi", plg.Plugin.SORT_LINKS + 5, this.removeDdpSsiUI, 20);
        }
    },

    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        CQ.Util.applyDefaults(pluginConfig, {
            "tooltips": {
                "modifyddp": {
                    "title": CQ.I18n.getMessage("Option Link"),
                    "text": CQ.I18n.getMessage("Add an equipment option link.")
                },
                "removeddp": {
                    "title": CQ.I18n.getMessage("Option Link"),
                    "text": CQ.I18n.getMessage("Remove an equipment option link.")
                }
            }
        });
        this.config = pluginConfig;
    },

    execute: function(cmd, value, env) {
        if (cmd == "modifyddp") {
            this.modifyDdpSsi(env.editContext);
        } else {
            this.editorKernel.relayCmd(cmd);
        }
    },

    updateState: function(selDef) {
        var hasSingleAnchor = selDef.anchorCount == 1;
        var hasNoAnchor = selDef.anchorCount === 0;
        var selectedNode = selDef.selectedDom;
        var isLinkableObject = false;
        if (selectedNode) {
            isLinkableObject = CQ.form.rte.Common.isTag(selectedNode,
                    CQ.form.rte.plugins.LinkPlugin.LINKABLE_OBJECTS);
        }
        var isCreateSsiStatementEnabled = hasSingleAnchor || ((selDef.isSelection || isLinkableObject) && hasNoAnchor);
        if (this.ddpSsiUI) {
            this.ddpSsiUI.getExtUI().setDisabled(!isCreateSsiStatementEnabled);
        }
        if (this.removeDdpSsiUI) {
            this.removeDdpSsiUI.getExtUI().setDisabled(!hasSingleAnchor);
        }
    }
});

//register plugin
CQ.form.rte.plugins.PluginRegistry.register("ddpssi", CQ.form.rte.plugins.DdpSsiPlugin);

CQ.form.ExteriorViews = CQ.Ext.extend(CQ.form.CompositeField, {
    /**
     * @private
     * @type CQ.Ext.form.TextField
     */
    hiddenField: null,

    /**
     * @private
     * @type CQ.Ext.form.ComboBox
     */
    allowField: null,

    /**
     * @private
     * @type CQ.Ext.form.TextField
     */
    otherField: null,
    
    constructor: function(config) {
        config = config || { };
        var defaults = {
            border: false,
            layout: 'column'
        };
        config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.ExteriorViews.superclass.constructor.call(this, config);
    },

    // overriding CQ.Ext.Component#initComponent
    initComponent: function() {
    	CQ.form.ExteriorViews.superclass.initComponent.call(this);

        this.hiddenField = new CQ.Ext.form.Hidden({
            name: this.name
        });
        this.add(this.hiddenField);
        
        this.allowField = new CQ.form.Selection({
    		allowBlank: false,
            type: 'select',
            listeners: {
                selectionchanged: {
                    scope:this,
                    fn: this.updateHidden
                }
            },
            options: this.getDegrees()
        });
        
        this.col1 = new CQ.Ext.Panel({
        	width: 80,
		    height: 'auto',
		    border: false,
		    items: this.allowField
		});
        this.add(this.col1);        
        
        this.otherField = new CQ.Ext.form.TextField({
            style: 'margin-left: 5px; width: 93%;',
            listeners: {
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        
        this.col2 = new CQ.Ext.Panel({
        	columnWidth: .99,
		    height: 'auto',
		    border: false,
		    items: this.otherField
		});
        this.add(this.col2);        
    },

    // overriding CQ.form.CompositeField#processPath
    processPath: function(path) {
        this.allowField.processPath(path);
    },

    // overriding CQ.form.CompositeField#processRecord
    processRecord: function(record, path) {
        this.allowField.processRecord(record, path);
    },

    // overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
        var json = CQ.Ext.util.JSON.decode(value);
        this.allowField.setValue(json.degree);
        this.otherField.setValue(json.nameOfView);
        this.hiddenField.setValue(value);
    },

    // overriding CQ.form.CompositeField#getValue
    getValue: function() {
        return this.getRawValue();
    },

    // overriding CQ.form.CompositeField#getRawValue
    getRawValue: function() {
        if (!this.allowField) {
            return CQ.Ext.util.JSON.encode({degree: '', nameOfView: ''});
        }
        return CQ.Ext.util.JSON.encode({
        	degree: this.allowField.getValue(),
        	nameOfView: this.otherField.getValue()
        });
    },

    // private
    updateHidden: function() {
        this.hiddenField.setValue(this.getValue());
    },
    
    //private
    getDegrees: function() {
    	var o = [];
    	for (var i = 0; i < 36; i++) {
    		o.push({
    			value: (i < 10 ? 0 + '' : '') + i,
    			text: (i < 10 ? 0 + '' : '') + i    			
    		});
    	}    	
    	return o;
    }

});
// register xtype
CQ.Ext.reg('exteriorviews', CQ.form.ExteriorViews);

/**
 * @author syee@crownpartners.com
 * @class CQ.form.JsParameterList
 * Comments: This is only used for the ut_js_c1 component.
 */
CQ.form.JsParameterList = CQ.Ext.extend(CQ.form.CompositeField, {
    /**
     * @private
     * @type CQ.Ext.form.TextField
     */
    hiddenField: null,

    /**
     * @private
     * @type CQ.Ext.form.ComboBox
     */
    allowField: null,

    /**
     * @private
     * @type CQ.Ext.form.TextField
     */
    otherField: null,
    
    constructor: function(config) {
        config = config || { };
        var defaults = {
            border: false,
            layout: 'column'
        };
        config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.JsParameterList.superclass.constructor.call(this, config);
    },

    // overriding CQ.Ext.Component#initComponent
    initComponent: function() {
    	CQ.form.JsParameterList.superclass.initComponent.call(this);

        this.hiddenField = new CQ.Ext.form.Hidden({
            name: this.name
        });
        this.add(this.hiddenField);
        
        this.allowField = new CQ.form.Selection({
    		allowBlank: false,
            type: 'select',
            optionsCallback : function(path, record) {
            	var options = gmdsJavascriptParameterList().getParameterList(this);
            	// there are options, set it into the allowField widget. subsequently make sure to default to the first option.
            	if(options.length > 0) {
            		if(this.ownerCt.ownerCt.ownerCt.ownerCt.ownerCt.ownerCt.hasClass('x-hide-display') === true) {
            			this.ownerCt.ownerCt.ownerCt.ownerCt.ownerCt.ownerCt.removeClass('x-hide-display'); 
            		}
            		this.setOptions(gmdsJavascriptParameterList().getParameterList(this));
            		// out of scope to use gmdsSelectionHelper.selectFirstAsDefault, so let's copy and paste it ourselves.
                	if (this.getValue && !this.getValue()) {
            			if (this.comboBox && this.comboBox.getStore) {
            				var store = this.comboBox.getStore();
            				if (store) {
            					var first = store.getAt(0);
            					if (first && first.data && 'value' in first.data) {
            						this.setValue(first.data.value);
            						this.fireEvent(CQ.form.Selection.EVENT_SELECTION_CHANGED,
            							this, first.data.value, true);
            					} 
            				}
            			}
            		}
            	} else {
            		// if no options. we need to delete the multifielditem widget again... This is just the case if there are no longer parameters when the dialog loads up.
            		var multifielditem = this.ownerCt.ownerCt.ownerCt.ownerCt;
            		var parametersPanel = this.ownerCt.ownerCt.ownerCt.ownerCt.ownerCt.ownerCt;
            		multifielditem.ownerCt.remove(multifielditem, true);
            		// hide the multifield if there isn't any parameters.
            		if(parametersPanel.hasClass('x-hide-display') === false) {
            			parametersPanel.addClass('x-hide-display');
            		}
            	}  	
            },
            listeners: {
                selectionchanged: {
                    scope:this,
                    fn: this.updateHidden
                }
            }
        });
        
        this.col1 = new CQ.Ext.Panel({
        	width: 80,
		    height: 'auto',
		    border: false,
		    items: this.allowField
		});
        this.add(this.col1);        
        
        this.otherField = new CQ.Ext.form.TextField({
            style: 'margin-left: 5px; width: 93%;',
            listeners: {
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        
        this.col2 = new CQ.Ext.Panel({
        	columnWidth: .99,
		    height: 'auto',
		    border: false,
		    items: this.otherField
		});
        this.add(this.col2);        
    },

    // overriding CQ.form.CompositeField#processPath
    processPath: function(path) {
        this.allowField.processPath(path);
    },

    // overriding CQ.form.CompositeField#processRecord
    processRecord: function(record, path) {
        this.allowField.processRecord(record, path);
    },

    // overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
        var json = CQ.Ext.util.JSON.decode(value);
        this.allowField.setValue(json.parameter);
        this.otherField.setValue(json.value);
        this.hiddenField.setValue(value);
    },

    // overriding CQ.form.CompositeField#getValue
    getValue: function() {
        return this.getRawValue();
    },

    // overriding CQ.form.CompositeField#getRawValue
    getRawValue: function() {
        if (!this.allowField) {
            return CQ.Ext.util.JSON.encode({parameter: '', value: ''});
        }
        return CQ.Ext.util.JSON.encode({
        	parameter: this.allowField.getValue(),
        	value: this.otherField.getValue()
        });
    },

    // private
    updateHidden: function() {
        this.hiddenField.setValue(this.getValue());
    }

});
// register xtype
CQ.Ext.reg('jsparameterlist', CQ.form.JsParameterList);

// Adds the new action to the CQ.wcm.msm.MSM.ACTIONS array
CQ.wcm.msm.MSM.ACTIONS.push(CQ.wcm.msm.MSM.SourceVersionAction);
CQ.wcm.msm.MSM.ACTIONS.push(CQ.wcm.msm.MSM.TargetVersionAction);

// see GMDSST-2919
// see DayCare Ticket 15170
// Overrides /libs/cq/ui/widgets/source/ext/source/data/core/Connection.js
// attention: thismust be executed before NotificationInbox.js
CQ.Ext.override(CQ.Ext.data.Connection, {
   timeout: 600000
});
// see GMDSST-2845
// see DayCare Ticket: 15123
/*
 * Copyright 1997-2008 Day Management AG
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
 * @class CQ.wcm.NotificationInbox
 * @extends CQ.Ext.Viewport
 * The NotificationInbox allows the user to subscribe to WCM actions
 * and manage notifications.
 * @constructor
 * Creates a new NotificationInbox.
 * @param {Object} config The config object
 */
CQ.wcm.NotificationInbox = CQ.Ext.extend(CQ.Ext.Viewport, {

    constructor: function(config) {
		this.debug = config.debug;

		// grid config
		var cm = new CQ.Ext.grid.ColumnModel([
  		    new CQ.Ext.grid.RowNumberer(),
  		    {
  		        "header":CQ.I18n.getMessage("Modification"),
  		        "dataIndex":"modification"
  		    },{
  		        "header":CQ.I18n.getMessage("Path"),
  		        "dataIndex":"path"
  		    },{
  		        "header":CQ.I18n.getMessage("Date"),
  		        "dataIndex":"date"
  		    },{
  		        "header":CQ.I18n.getMessage("User"),
  		        "dataIndex":"user"
  		    },{
  		        "header":CQ.I18n.getMessage("Read"),
  		        "dataIndex":"isRead"
  		    }
  		]);
  		cm.defaultSortable = true;

  		var sm = new CQ.Ext.grid.RowSelectionModel({
  			"singleSelect":true
  		});

  		var storeConfig = CQ.Util.applyDefaults(config.store, {
  			"autoLoad":true,
	        "proxy": new CQ.Ext.data.HttpProxy({
	        	"url":"/bin/wcm/notification/inbox/messages.json",
	        	"method":"GET"
	        }),
	        "baseParams":{
  			    "start":0,
  			    "limit":250 // see GMDSST-2845, DayCare Ticket: 15123 ?
  		    },
	        "reader": new CQ.Ext.data.JsonReader({
	            "totalProperty": "results", "root": "messages","id":"id",
	            "fields": [ "id", "modification", "path", "date", "user",
	                        { "name":"isRead", "type":"bool" },
	                        { "name":"isUserMessage", "type":"bool" }
	            ]
	        })
	    });
  		var store = new CQ.Ext.data.GroupingStore(storeConfig);

		// init component by calling super constructor
		CQ.wcm.NotificationInbox.superclass.constructor.call(this, {
			"id":"cq-notification-inbox",
            "layout":"border",
            "renderTo":"CQ",
            "items": [
                {
                	"id":"cq-notification-inbox-wrapper",
                	"xtype":"panel",
                	"layout":"border",
                	"region":"center",
                	"border":false,
                	"items": [
						{
						    "id":"cq-header",
						    "xtype":"container",
						    "region":"north",
						    "autoEl":"div",
                            "cls": "cq-header-toolbar",
						    "items": [
						        new CQ.HomeLink({})
						    ]
						},
						{
				            "xtype": "grid",
				            "id":"cq-notification-inbox-grid",
				            "region":"center",
				            "margins":"5 5 5 5",
				            "pageSize":25,
				            "loadMask":true,
				            "stripeRows":true,
				            "cm":cm,
				            "sm":sm,
				            "viewConfig": new CQ.Ext.grid.GroupingView({
				                "forceFit":true,
				                "groupTextTpl": '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Messages" : "Message"]})'
				            }),
				            /* // see GMDSST-2845, DayCare Ticket: 15123 ?
				            "bbar": new CQ.Ext.PagingToolbar({
				            	"pageSize": 25,
				            	"store": store,
				                "displayInfo": true,
				                "displayMsg": CQ.I18n.getMessage("Displaying messages {0} - {1} of {2}"),
				                "emptyMsg" : CQ.I18n.getMessage("No message to display")
				            }),
				            */
				            "tbar": [
								{
								    "id":"cq-notification-inbox-read",
								    "text":CQ.I18n.getMessage('Approve'),
								    "handler":this.approveMessage,
								    "tooltip": {
								        "title":CQ.I18n.getMessage('Approve the message'),
								        "text":CQ.I18n.getMessage('Approves a message and marks it as read.'),
								        "autoHide":true
								    }
								},
								{
								    "id":"cq-notification-inbox-remove",
								    "text":CQ.I18n.getMessage('Delete'),
								    "handler":this.deleteMessage,
								    "tooltip": {
								        "title":CQ.I18n.getMessage('Delete the message'),
								        "text":CQ.I18n.getMessage('Deletes a message.'),
								        "autoHide":true
								    }
								},
								{
								    "id":"cq-notification-inbox-config",
								    "text":CQ.I18n.getMessage('Configure...'),
								    "handler":this.showConfigDialog,
								    "tooltip": {
								        "title":CQ.I18n.getMessage('Configure subscriptions'),
								        "text":CQ.I18n.getMessage('Opens the subscription configuration dialog.'),
								        "autoHide":true
								    }
								}
				            ],
				            "store":store
				        }
                	]
                }
            ]
        });
    },

    initComponent : function() {
        CQ.wcm.NotificationInbox.superclass.initComponent.call(this);
    },

    reloadAll: function() {
    	CQ.Ext.getCmp("cq-notification-inbox-grid").getStore().reload();
    },

    approveMessage : function() {
    	var grid = CQ.Ext.getCmp("cq-notification-inbox-grid");
    	var selections = grid.getSelectionModel().getSelections();
    	for (var i=0; i<selections.length; i++) {
    		var selection = selections[i];
    		CQ.Ext.Ajax.request({
    			"url":CQ.HTTP.externalize("/bin/wcm/notification/inbox/action.json"),
    			"success":CQ.Ext.getCmp("cq-notification-inbox-grid").getStore().reload(),
    			"failure":function() {
    				CQ.Ext.Msg.alert("Error", "Could not approve message: "
    					+ selection.id)
    			},
    			"params":{
    				"path":selection.id,
    				"cmd":"approve"
    			}
     		});
    	}
    	grid.getStore().reload();
    },

    deleteMessage : function() {
    	var grid = CQ.Ext.getCmp("cq-notification-inbox-grid");
    	var selections = grid.getSelectionModel().getSelections();
    	for (var i=0; i<selections.length; i++) {
    		var selection = selections[i];
    		CQ.Ext.Ajax.request({
    			"url":CQ.HTTP.externalize("/bin/wcm/notification/inbox/action.json"),
    			"success":CQ.Ext.getCmp("cq-notification-inbox-grid").getStore().reload(),
    			"failure":function() {
    				CQ.Ext.Msg.alert("Error", "Could not remove message: "
    					+ selection.id)
    			},
    			"params":{
    				"path":selection.id,
    				"cmd":"delete"
    			}
     		});
    	}
    	grid.getStore().reload();
    },

    showConfigDialog : function() {
		// grid config
        function formatExact(value) {
        	if ( value == "true" ) {
        		return CQ.I18n.getMessage("Yes");
        	}
        	return CQ.I18n.getMessage("No");
        };
        function formatRule(value) {
        	if ( value == "true" ) {
        		return CQ.I18n.getMessage("Allow");
        	}
        	return CQ.I18n.getMessage("Deny");
        };

		var cm = new CQ.Ext.grid.ColumnModel([
  		    {
  		        "header":CQ.I18n.getMessage("Path"),
  		        "dataIndex":"path",
   		        "editor": new CQ.Ext.form.TextField({
  	               "allowBlank": false
    	        })

  		    },
  		    {
  		    	"header": CQ.I18n.getMessage("Exact?"),
     	        "dataIndex": "exact",
  		        "renderer":formatExact,
     	        "editor": new CQ.Ext.form.ComboBox({
     	        	"store":[["true",CQ.I18n.getMessage("Yes")],["false",CQ.I18n.getMessage("No")]],
     	            "triggerAction" : "all"
     	        })
  		    },
  		    {
  		        "header":CQ.I18n.getMessage("Rule"),
  		        "dataIndex":"allow",
  		        "renderer":formatRule,
     	        "editor": new CQ.Ext.form.ComboBox({
     	        	"store":[["true",CQ.I18n.getMessage("Allow")],["false",CQ.I18n.getMessage("Deny")]],
     	     	    "triggerAction" : "all"
     	        })

  		    }
  		]);

		var addAction = new CQ.Ext.Action({
		    "cls":"cq-notification-subscriptions-add",
		    "text":CQ.I18n.getMessage('Add'),
		    "handler":function() {store.add(new CQ.Ext.data.Record({"path":"", "exact":"true", "allow":"true"}));},
		    scope:this,
		    "tooltip": {
		        "title":CQ.I18n.getMessage('Add a subscription'),
		        "text":CQ.I18n.getMessage('Adds a new subscription.'),
		        "autoHide":true
		    }
		});

		var removeAction = new CQ.Ext.Action({
		    "cls":"cq-notification-subscriptions-remove",
		    "text":CQ.I18n.getMessage('Delete'),
		    "disabled":true,
		    "handler":function() {
		    	var grid = CQ.Ext.getCmp("cq-notification-subscriptions-grid");
		    	var selections = grid.getSelectionModel().getSelections();
		    	for (var i=0; i<selections.length; i++) {
		    		var selection = selections[i];
		    		grid.getStore().remove(selection);
		    	}
		    },
		    "tooltip": {
		        "title":CQ.I18n.getMessage('Delete the subscription'),
		        "text":CQ.I18n.getMessage('Deletes a subscription.'),
		        "autoHide":true
		    }
		});
		var actions = [ addAction, removeAction ];

		var sm = new CQ.Ext.grid.RowSelectionModel({
  			"singleSelect":false,
  			listeners: {
		        selectionchange: function(selectionModel) {
		            if (selectionModel.hasSelection()) {
		                removeAction.setDisabled(false);
		            } else {
		                removeAction.setDisabled(true);
		            }
		        }
		    }
  		});

  		var options = [{
            value: "Activate",
            text: CQ.I18n.getMessage("Activated")
        },
        {
            value: "Deactivate",
            text: CQ.I18n.getMessage("Deactivated")
        },
        {
            value: "Delete",
            text: CQ.I18n.getMessage("Deleted (syndication)")
        },
        {
            value: "PageModified",
            text: CQ.I18n.getMessage("Modified")
        },
        {
            value: "PageCreated",
            text: CQ.I18n.getMessage("Created")
        },
        {
            value: "PageDeleted",
            text: CQ.I18n.getMessage("Deleted")
        },
        {
            value: "PageRolledOut",
            text: CQ.I18n.getMessage("Rolled out")
        }
        ];

  		var storeConfig =  {
  			"autoLoad":true,
	        "proxy": new CQ.Ext.data.HttpProxy({
	        	"url":"/bin/wcm/notification/config.json",
	        	"method":"GET"
	        }),
	        "baseParams":{
  			    "start":0,
  			    "limit":25
  		    },
  		    "listeners": {
  		    	load: function(theStore, records, options) {
     		    	var channelTypeWidget = CQ.Ext.getCmp("inbox-channel-combo");
     		    	channelTypeWidget.setValue(storeConfig.reader.jsonData.type);

   		            var actionsWidget = CQ.Ext.getCmp("inbox-actions-selection");
                    actionsWidget.setValue(storeConfig.reader.jsonData.actions);
                }
  		    },
	        "reader": new CQ.Ext.data.JsonReader({
	            "totalProperty": "results", "root": "configs",
	            "fields": [ "path", "exact", "allow"]
	        })
	    };
  		var store = new CQ.Ext.data.GroupingStore(storeConfig);

        var createDialog = {
            "jcr:primaryType": "cq:Dialog",
            "title":CQ.I18n.getMessage("Subscribe..."),
    	    "buttons": [
    	                  {
    	    	              "text": CQ.I18n.getMessage("OK"),
    	    	              "handler": function() {

    	                	      var channelTypeWidget = CQ.Ext.getCmp("inbox-channel-combo");

    	                	      var actionsWidget = CQ.Ext.getCmp("inbox-actions-selection");

    	                	      var records = new Array(store.getCount());
             		    	      for(var i=0; i<store.getCount(); i++) {
             		    	    	  var r = store.getAt(i);
             		    	    	  records[i] = new Array(3);
             		    	    	  records[i][0] = r.get("path");
             		    	    	  records[i][1] = r.get("exact");
             		    	    	  records[i][2] = r.get("allow");
             		    	      }
    	    	                  CQ.HTTP.post(
    	    			              "/bin/wcm/notification/config.json",
    	    			              function(options, success, response) {
    	    			                  if (success) {
    	    			                      dialog.hide();
    	    			                  }
    	    			              },
    	    			              {
    	    			                  "type": channelTypeWidget.getValue(),
                                          "actions":actionsWidget.getValue(),
                                          "configs":CQ.Ext.util.JSON.encode(records)
    	    			              }
    	    			          );
    	    	              }
   	                  },
   	                  CQ.Dialog.CANCEL
  	            ],
    	    "items": {
                "jcr:primaryType": "cq:Panel",
                "items": {
                    "jcr:primaryType": "cq:WidgetCollection",
   		            "channel": {
   		                "xtype": "combo",
    		            "fieldLabel": CQ.I18n.getMessage("Select Notification Channels"),
    		            "editable":false,
    		            "id":"inbox-channel-combo",
                        "triggerAction": "all",
    		            "store":[
                            [ "inbox", CQ.I18n.getMessage("Inbox")],
                            [ "email", CQ.I18n.getMessage("Email")]
                        ]
    		        },
    		        "actions": {
    		            "xtype": "selection",
    		            "type": "checkbox",
    		            "fieldLabel": CQ.I18n.getMessage("Select actions to be notified"),
    		            "editable":false,
    		            "id":"inbox-actions-selection",
    		            "options":options
    		        },
    		        "sub1": {
    		            "xtype": "label",
    		            "text": CQ.I18n.getMessage("Define Packages")
    		        },
    		        "subscriptions" : {
			            "xtype": "editorgrid",
			            "id":"cq-notification-subscriptions-grid",
			            "region":"center",
			            "anchor":"-30 -100",
			            "margins":"5 5 5 5",
			            "loadMask":true,
			            "stripeRows":true,
			            "clicksToEdit":1,
			            "cm":cm,
			            "sm":sm,
			            "viewConfig": new CQ.Ext.grid.GroupingView({
			                "forceFit":true
			            }),
			            "tbar": actions,
			            "store":store,
			            "listeners": {
			                rowcontextmenu: function(grid, index, e) {
			                    if (!this.contextMenu) {
			                        this.contextMenu = new CQ.Ext.menu.Menu({
			                            items: actions
			                        });
			                    }
			                    var xy = e.getXY();
			                    this.contextMenu.showAt(xy);
			                    e.stopEvent();
			                }
			            }
    		        }
                }
            }
        };
        var dialog = CQ.WCM.getDialog(createDialog, "cq.notification.inbox.dialog");
    	dialog.failure = function(){CQ.Ext.Msg.alert("Error", "Could not save subscriptions.")};
    	dialog.show();
    }
});

CQ.Ext.reg("notificationinbox", CQ.wcm.NotificationInbox);
// toggles widget within page property dialogs
function toggleWidget(widget, value, itemNamesToDisable, valuesWhichWillCauseDisable){
    var disable = false;
    var isInArray = valuesWhichWillCauseDisable.indexOf(value);
    if(isInArray !== -1){
        disable = true;
    }
    for (var i = 0; i < widget.ownerCt.items.length; i++) {
        var item = widget.ownerCt.items.items[i];
        if (itemNamesToDisable.indexOf(item.name)  !== -1){
            var el = CQ.Ext.get(item.getId());
            if (disable) {
                el.setStyle('display', 'none');
            } else {
                el.setStyle('display', 'block');
                CQ.Ext.getCmp(item.getId()).doLayout(true,true);
            }
        }
    }
};


jQuery(document).ready(function() {
    jQuery('#pagetools_button').click(function() {
        jQuery('#unfloat').toggle();
    });

    jQuery('#unfloat').mouseover(function() {
        jQuery('#tooltip_mm_3').show();
    });

    jQuery('#unfloat').mouseout(function() {
        jQuery('#tooltip_mm_3').hide();
    });

    jQuery('#unfloat').click(function() {
        jQuery('.ui_position_float_rel').addClass('unfloat');
    });
});

function getXMLHttpObject() {
    //get request object for the different browsers
    var XMLHttpFactories = [
        function () {return new XMLHttpRequest();},
        function () {return new ActiveXObject("Msxml2.XMLHTTP");},
        function () {return new ActiveXObject("Msxml3.XMLHTTP");},
        function () {return new ActiveXObject("Microsoft.XMLHTTP");}
    ];
    var xmlhttp = false;
    for (var i=0;i<XMLHttpFactories.length;i++) {
        try {
            xmlhttp = XMLHttpFactories[i]();
        }
        catch (e) {
            continue;
        }
        break;
    }
    return xmlhttp;
}
// function used to render calendar into panel of a dialog
(function() {
    var calendarDialog = new CalendarDialog();
    window.calendarDialog = function () {
        return calendarDialog;
    };
})();

function CalendarDialog() {
    var arr = [], loaded = false;
    var reset = function() {
        var node = CQ.Ext.DomQuery.selectNode('#calendar_dialog');
        if (typeof node !== 'undefined') {
            node.parentNode.innerHTML = "";
        }
    };
    var populate = function(panel) {
        // first load the placeholder (loading symbol)
        panel.body.update("<div style='line-height:250%; text-align:center;'> <img src='/static/all/images/loader.gif' /><br />... loading ...</div>");
        // then send the ajax request to get the html to put in the dialog
        CQ.Ext.Ajax.request({
            url: panel.ownerCt.ownerCt.initialConfig.responseScope.path + '.dialog_calendar.html',
            success: function(response, opts) {
                panel.body.update(response.responseText);
                init();
            },
            failure: function(response, opts) {
                CQ.Ext.Msg.show({
                    title: CQ.I18n.getMessage('Error'),
                    msg: CQ.I18n.getMessage(response.responseText),
                    buttons: CQ.Ext.Msg.OK,
                    icon: CQ.Ext.Msg.ERROR
                });
            }
        });
    };
    var init = function() {
        CQ.Ext.get(CQ.Ext.DomQuery.selectNode('#calendar_dialog #calendar_add')).on('click', function() {
            add();
        });
        var value = CQ.Ext.DomQuery.selectNode('#calendar_dialog #calendar_value').value;
        if (value.substring(0,1) == ',') {
            value = value.substring(1);
        }
        arr = value.split(',');
        repaintRows();
    };
    var add = function() {
        var year = CQ.Ext.DomQuery.selectNode('#calendar_dialog #calendar_year').value;
        var month = CQ.Ext.DomQuery.selectNode('#calendar_dialog #calendar_month').value;
        var day = CQ.Ext.DomQuery.selectNode('#calendar_dialog #calendar_day').value;
        if(arr[0] === "") {
            arr[0] = year + "-" + month + "-" + day;
        } else {
            arr.push(year + "-" + month + "-" + day);
        }
        arr.sort();
        save();
        repaintRows();
    };
    var deleteAll = function() {
        arr = [];
        save();
        repaintRows();
    };
    var deleteRow = function(id) {
        var tmpArray = [];
        for (var i = 0; i < arr.length; i++) {
            if (i != id) {
                tmpArray.push(arr[i]);
            }
        }
        arr = tmpArray;
        save();
        repaintRows();
    };
    var save = function() {
        var s = "";
        for (var i = 0; i < arr.length; i++) {
            if (s != 0) {
                s += ",";
            }
            s += arr[i];
        }
        CQ.Ext.DomQuery.selectNode('#calendar_dialog #calendar_value').value = s;
    };
    var repaintRows = function() {
        var s = "<table style=\"width : 95%;\">";
        s += "<thead><tr><th>List of dates</th><th></th></tr></thead>";
        var numberOfItems = (arr[0] === "") ? 0 : arr.length;
        s += "<tfoot><tr><td>Number of days in list: " + numberOfItems + "</td>";
        s += "<td><button class='x-btn-text' type='button' id='deleteAll'>delete all</button></td></tr></tfoot>";
        s += "<tbody>";

        if(arr[0] === "") {
            s += "<tr><td></td><td></td></tr>";
        } else {
            var events = [];
            for (var i = 0; i < arr.length; i++) {
                var id = (Math.random() + "").replace(".", "");
                var cssClass = (i % 2 != 0) ? "odd" : "even";
                s += "<tr class='" + cssClass + "'><td>" + formatDate(arr[i]) + "</td>";
                s += "<td><button class='x-btn-text' type='button' rowId='" + i + "' id='delete_" + id + "' value='reset'>delete</button></td>";
                s += "</tr>";
                events.push('delete_' + id);
            }
        }
        s += "</tbody></table>";
        CQ.Ext.DomQuery.selectNode('#calendar_dialog #date_list').innerHTML = s;

        if(arr[0] !== "") {
            for (var i = 0; i < events.length; i++) {
                CQ.Ext.get(CQ.Ext.DomQuery.selectNode('#' + events[i])).on('click', function() {
                    deleteRow(this.dom.getAttribute('rowId'));
                });
            }
        }

        CQ.Ext.get(CQ.Ext.DomQuery.selectNode('#deleteAll')).on('click', function() {
            deleteAll();
        });
    };
    var formatDate = function(s) {
        var date = s.split('-');
        var year = date[0];
        var month = date[1];
        var day = date[2];
        var monthname = month + '.';
        switch(month) {
            case '01': monthname = "January"; break;
            case '02': monthname = "February"; break;
            case '03': monthname = "March"; break;
            case '04': monthname = "April"; break;
            case '05': monthname = "May"; break;
            case '06': monthname = "June"; break;
            case '07': monthname = "July"; break;
            case '08': monthname = "August"; break;
            case '09': monthname = "September"; break;
            case '10': monthname = "October"; break;
            case '11': monthname = "November"; break;
            case '12': monthname = "December"; break;
        }
        return day + '. ' + monthname + ' ' + year;
    };
    // public
    this.load = function(panel) {
        // bind once on render of dialog
        panel.ownerCt.ownerCt.on("loadContent", function() {
            reset();
            populate(panel);
        });
    }
}

//function to get the available parameter options for a given internal link
(function() {
    var gmdsParameterizedLinkOpts = new GmdsParameterizedLinkOpts();
    window.gmdsGetParameterizedLinkOpts = function () {
        return gmdsParameterizedLinkOpts;
    };
})();

function GmdsParameterizedLinkOpts() {
    var emptyJson = "[{value:\"\", text:\"- No link parameters available -\"}]";
    var preventJson = "[{value:\"\", text:\"- Parameterized linking to a page you are not allowed -\"}]";
    var internalLink = undefined;
    var mode = "all";

    this.setInternalLink = function(path) {
        internalLink = path;
    }

    this.setMode = function(m) {
        mode = m;
    }

    this.getInternalLink = function(widget, name) {
        var propertyName = name ? name : './internalLink';
        if (internalLink === undefined) {
            for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
                var item = widget.ownerCt.items.items[i];
                if(item.name == propertyName){
                    internalLink = item.value;
                    break;
                }
            }
        }
    }

    this.getLinkParams = function() {
        if(internalLink === undefined || internalLink === null || internalLink.length === 0){
            return eval(emptyJson);
        }
        return this.reloadJson(internalLink);
    }

    this.reloadJson = function(path) {
        var ajaxUrl = "/bin/parameterizedlink.json?path=" + escape(path) + "&mode=" + escape(mode);
        var optionsJson = eval(mrm.$.ajax({
            url: ajaxUrl,
            async: false,
            type:"GET"
        }).responseText);
        if(optionsJson[0] === undefined){
            return eval(emptyJson);
        }
        return optionsJson;
    }
}


//function to get the available services as parameter with fixed values for the dealer locator
(function() {
    var gmdsUtLoc2Opts = new GmdsUtLoc2Opts();
    window.gmdsGetUtLoc2Opts = function () {
        return gmdsUtLoc2Opts;
    };
})();

function GmdsUtLoc2Opts() {
    var emptyJson = "[{value:\"\", text:\"- No service available -\"}]";
    var preventJson = "[{value:\"\", text:\"- Linking to a page you are not allowed to -\"}]";
    var internalLink = undefined;
    var mode = "all";

    this.setInternalLink = function(path) {
        internalLink = path;
    }

    this.setMode = function(m) {
        mode = m;
    }

    this.getLinkParams = function() {
        if(internalLink === undefined){
            return eval(emptyJson);
        }
        if(internalLink === CQ.WCM.getPagePath()) {
            return eval(preventJson);
        }
        return this.reloadJson(internalLink);
    }

    this.reloadJson = function(path) {
        var ajaxUrl = "/bin/parameterizedlink.json?path=" + escape(path) + "&mode=" + escape(mode);
        var optionsJson = eval(mrm.$.ajax({
            url: ajaxUrl,
            async: false,
            type:"GET"
        }).responseText);
        if(optionsJson[0] === undefined){
            return eval(emptyJson);
        }
        return optionsJson;
    }
}

(function() {
    var gmdsInteriorExteriorView = new GmdsInteriorExteriorView();
    window.gmdsInteriorExteriorView = function () {
        return gmdsInteriorExteriorView;
    };
})();

function GmdsInteriorExteriorView() {

    this.toggleImageObligation = function(widget, value, tabIndex) {

        var tabpanel = widget.findParentByType("tabpanel");
        var galleryTab = tabpanel.items.get(tabIndex);
        if (undefined !== galleryTab) {
            for (var i = 0; i < galleryTab.items.items.length; i++) {
                var item = galleryTab.items.items[i];
                if ("gallery" === value) {
                    if (item.name === "./galleryImage1" || item.name === "./galleryImage2" || item.name === "./galleryButtonLabel1" || item.name === "./galleryButtonLabel2") {
                            item.allowBlank = false;
                            item.validate();
                    }
                } else {
                    if (item.name === "./galleryImage1" || item.name === "./galleryImage2" || item.name === "./galleryButtonLabel1" || item.name === "./galleryButtonLabel2") {
                        item.allowBlank = true;
                        item.validate();
                    }
                }
            }
        }
    }
}

//function to render the dialog with the deep-link-parameter for the given internal link
(function() {
    var gmdsDeepLinkOpts = new GmdsDeepLinkOpts();
    window.gmdsGetDeepLinkOpts = function () {
        return gmdsDeepLinkOpts;
    };
})();

function GmdsDeepLinkOpts() {

    var emptyJson = "[{value:\"\", text:\"- No deeplink targets available -\"}]";
    var preventJson = "[{value:\"\", text:\"- Deep linking to page you are on not allowed -\"}]";

    this.getDeepLinkParam = function(widget, name) {
        var propertyName = name ? name : './internalLink';
        var internalLink;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if(item.name == propertyName){
                internalLink = item.value;
                break;
            }
        }
        if(internalLink === undefined || internalLink.length == 0 || internalLink === CQ.WCM.getPagePath()){
            return eval(emptyJson);
        }

        return this.reloadJson(internalLink);
    }

    this.setNewDeepLinkParam = function(browseField, internalLink, name) {
        var propertyName = name ? name : './deeplinkParam';
        var deepLinkParamDropdown;
        for (var i = 0; i < browseField.ownerCt.items.items.length; i++) {
            var item = browseField.ownerCt.items.items[i];
            if (item.name == propertyName) {
                deepLinkParamDropdown = item;
                break;
            }
        }
        if(internalLink === undefined || internalLink.length == 0 || internalLink === CQ.WCM.getPagePath()){
            deepLinkParamDropdown.setOptions(eval(emptyJson));
        } else {
            deepLinkParamDropdown.setOptions(this.reloadJson(internalLink));
        }
    }

    this.reloadJson = function(path) {
        if (path === undefined || path.length == 0) {
            return eval(emptyJson);
        }
        var ajaxUrl = "/bin/deeplink.json?path=" + escape(path);
        var optionsJson = eval(mrm.$.ajax({
            url: ajaxUrl,
            async: false,
            type:"GET"
        }).responseText);
        if(optionsJson[0] === undefined){
            return eval(emptyJson);
        }
        // special treatment for features and specs table
        // TODO uncomment this code if quick solution isn't needed anymore (when ddp snippets available on author systems), see GMDSST-9673
        /*
         if (optionsJson[0].fstable !== undefined) {
         delete optionsJson[0].fstable;
         var lastIndex = path.lastIndexOf("/");
         var endsWith = (lastIndex !== -1) && (lastIndex + "/".length === path.length);
         if (endsWith) {
         path = path.substring(0, path.length - 1);
         }
         var html = mrm.$.ajax({
         url: escape(path) + ".html",
         async: false,
         type: "GET"
         }).responseText;
         if (html !== undefined) {
         var links = mrm.$("div.cnt_tbl_fs_c1 div.nav_tablay_1 ul:first a", html);
         if (links.length > 0) {
         mrm.$.each(links, function(){
         var href = mrm.$(this).attr("href").replace("#", "");
         var text = mrm.$(this).text().trim();
         optionsJson.push({"value" : href, "text" : "Tab-" + text});
         });
         } else {
         return eval(emptyJson);
         }
         } else {
         return eval(emptyJson);
         }
         }*/
        return optionsJson;
    }
}

(function() {
    var gmdsSlideTextOpts = new GmdsSlideTextOpts();
    window.gmdsGetSlideTextOpts = function () {
        return gmdsSlideTextOpts;
    };
})();

function GmdsSlideTextOpts() {
    this.enableDisableTruncationOpts = function(widget,value,checked) {
        var fieldset = widget.findParentByType('fieldset');
        this.enableDisableFields(fieldset,checked);
    }

    this.enableDisableFields = function(parent,checked){
        for ( var i = 0; i < parent.items.items.length; i++ ) {
            var item = parent.items.items[i];
            if(item.items){
                this.enableDisableFields(item,checked);
            } else if ( item.xtype == "numberfield" ||  item.xtype == "textfield") {
                item.allowBlank = !checked;
            }
        }
    }
}
//function to render the dialog with the deep-link-parameter for the given internal link
(function() {
    var gmdsBodystyleOpts = new GmdsBodystyleOpts();
    window.gmdsGetBodystyleOpts = function () {
        return gmdsBodystyleOpts;
    };
})();

function GmdsBodystyleOpts() {

    var emptyJson = "[{value:\"\", text:\"- No bodystyles available -\"}]";

    this.getBodystyleParam = function(widget, name) {
        var propertyName = name ? name : './baseballcardNodeLink',
            bbcLink;

        for ( var i = 0; i < widget.ownerCt.items.items.length; i++ ) {
            var item = widget.ownerCt.items.items[i];
            if ( item.name == propertyName ) {
                bbcLink = item.value;
                break;
            }
        }
        if ( bbcLink === undefined || bbcLink.length == 0 || bbcLink === CQ.WCM.getPagePath() ) {
            return jQuery.parseJSON(emptyJson);
        }

        return this.reloadJson(bbcLink);
    }

    this.setNewBodystyleParam = function(browseField, bbcLink, name) {
        var propertyName = name ? name : './default_bodystyle',
            bodystyleParamDropdown;
        for (var i = 0; i < browseField.ownerCt.items.items.length; i++) {
            var item = browseField.ownerCt.items.items[i];
            if ( item.name == propertyName ) {
                bodystyleParamDropdown = item;
                break;
            }
        }
        if ( bbcLink === undefined || bbcLink.length == 0 || bbcLink === CQ.WCM.getPagePath() ) {
            bodystyleParamDropdown.setOptions(jQuery.parseJSON(emptyJson));
        } else {
            bodystyleParamDropdown.setOptions(this.reloadJson(bbcLink));
        }
    }

    this.reloadJson = function(path) {
        if ( path === undefined || path.length == 0 ) {
            return jQuery.parseJSON(emptyJson);
        }
        var ajaxUrl = "/bin/bodystyle.json?path=" + escape(path);
        var optionsJson = jQuery.parseJSON(mrm.$.ajax({
            url: ajaxUrl,
            async: false,
            type:"GET"
        }).responseText);
        if ( optionsJson[0] === undefined ) {
            return jQuery.parseJSON(emptyJson);
        }
        return optionsJson;
    }
}

(function() {
    var gmdsStickyFooterShoppingLinkOpts = new GmdsStickyFooterShoppingLinkOpts();
    window.gmdsGetStickyFooterShoppingLinkOpts = function() {
        return gmdsStickyFooterShoppingLinkOpts;
    };
})();

function GmdsStickyFooterShoppingLinkOpts() {
    var emptyJson = "[{value:\"\", text:\"- No sticky footer shopping links -\"}]";

    this.getShoppingLinkOpts = function(widget) {
        var path = location.hash.substr(1);

        if ( path === undefined || path.length == 0 ) {
            return jQuery.parseJSON(emptyJson);
        }

        var ajaxUrl = "/bin/footershoppinglinks.json?path=" + encodeURIComponent(path);

        // async is false so this is a synchronous / blocking request
        var optionsJson = jQuery.parseJSON(
            jQuery.ajax({
                url: ajaxUrl,
                async: false,
                type: "GET"
            }).responseText
        );

        if (optionsJson[0] === undefined) {
            return jQuery.parseJSON(emptyJson);
        }

        return optionsJson;
    }
}

//function to render the entrypoints for the wappwrapping config dialog
(function() {
    var gmdsWappwrappingApplications = new GmdsWappwrappingApplications();
    window.gmdsWappwrappingApplications = function () {
        return gmdsWappwrappingApplications;
    };
})();
function GmdsWappwrappingApplications() {

    // get the json-string with all entrypoint options consistent with the given
    // application id
    this.getOptionJson = function(appId){
        var optionsJson = "[";
        if (typeof allEntryPoints != 'undefined'){
            for (var i = 0; i < allEntryPoints.length; i++) {
                if(allEntryPoints[i].appId == appId){
                    var entryPoints = allEntryPoints[i].entryPoints;
                    for (var j = 0; j < entryPoints.length; j++) {
                        var items = entryPoints[j];
                        var name = items.name;
                        var id = items.id;
                        optionsJson = optionsJson + "{value:'"+id+"', text:'"+name+"'}";
                        if (j != entryPoints.length -1) {
                            optionsJson = optionsJson + ",";
                        }
                    }
                }
            }
        }else {
            optionsJson = optionsJson + "{value:\"\", text:\"There are no entry points available!\"}";
        }
        optionsJson = optionsJson + "]";
        return eval(optionsJson);
    }

    // get the entrypoint consistent with the saved application id
    this.getEntryPoints = function(widget) {
        var appId;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (item.name == './webwrappingAppId') {
                appId = item.value;
                break;
            }
        }
        return this.getOptionJson(appId);

    }

    // get the entrypoint consistent with the new choice of application id
    this.setNewEntryPoints = function(widget, appId) {
        var entryPointsDropdown;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (item.name == './webwrappingEntryPointId') {
                entryPointsDropdown = item;
                break;
            }
        }
        entryPointsDropdown.setOptions(this.getOptionJson(appId));
    }

    this.toggleSeparator = function(widget) {
        var separatorTx = widget.ownerCt.items.items[2];
        var separatorParamNameTx = widget.ownerCt.items.items[3];
        if (separatorTx.disabled) {
            separatorTx.enable();
        } else {
            separatorTx.disable();
        }
        if (separatorParamNameTx.disabled) {
            separatorParamNameTx.enable();
        } else {
            separatorParamNameTx.disable();
        }
    }
}


//function to render the dialog with the page layer containers defined on the page
(function() {
    var gmdsInPageOpts = new GmdsInPageOpts();
    window.gmdsInPageOpts = function() {
        return gmdsInPageOpts;
    }
})();

function GmdsInPageOpts() {
    var emptyInPage = "[{value:\"\", text:\"- No in page links available -\"}]";

    this.getLinks = function(widget, addClosestAnchorOption) {
        return this.reloadJson(CQ.WCM.getPagePath(), addClosestAnchorOption);
    };

    this.setLinks  = function(widget, internalLink, addClosestAnchorOption, name) {
        var propertyName = name ? name : './inPageLink';
        var inPageLink;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if(item.name == propertyName){
                inPageLink = item;
                break;
            }
        }

        inPageLink.setOptions(this.reloadJson(CQ.WCM.getPagePath(), addClosestAnchorOption));
    };

    this.reloadJson = function(path, addClosestAnchorOption) {
        if (path === undefined || path.length == 0) {
            return eval(emptyInPage);
        }
        var ajaxUrl = "/bin/deeplink.json?";
        if( addClosestAnchorOption ) {
            ajaxUrl = ajaxUrl + "addClosestAnchor=true&";
        }
        ajaxUrl = ajaxUrl + "addTopAnchor=true&addPageLayers=true&path=" + escape(path);
        var optionsJson = eval(mrm.$.ajax({
            url: ajaxUrl,
            async: false,
            type:"GET"
        }).responseText);
        if(optionsJson[0] === undefined){
            return eval(emptyInPage);
        }
        return optionsJson;
    };
}


//function to disable a widget
(function() {
    var gmdsDisableWidget = new GmdsDisableWidget();
    window.gmdsDisableWidget = function() {
        return gmdsDisableWidget;
    };
})();

function GmdsDisableWidget() {

    this.switchDisableIfNecessary = function(widget, value, itemNamesToDisable, valuesWhichWillCauseDisable){
        var disable = false;
        var isInArray = mrm.$.inArray(value, valuesWhichWillCauseDisable);
        if(isInArray > -1){
            disable = true;
        }

        for (var i = 0; i < widget.ownerCt.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (mrm.$.inArray(item.name, itemNamesToDisable) > -1){
                if (disable) {
                    item.setDisabled(true);
                } else {
                    item.setDisabled(false);
                }
            }
        }
    };
    this.switchEnableIfNecessary = function(widget, value, itemNamesToEnable, valuesWhichWillCauseEnable){
        var enable = false;
        var isInArray = mrm.$.inArray(value, valuesWhichWillCauseEnable);
        if(isInArray > -1){
            enable = true;
        }
        for (var i = 0; i < widget.ownerCt.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (mrm.$.inArray(item.name, itemNamesToEnable) > -1){
                if (enable) {
                    item.setDisabled(false);
                } else {
                    item.setDisabled(true);
                }
            }
        }
    };

    var temp = {};
    /**
     * @param widget the current widget
     * @param json the json holding selection to panel css class definitions and default/initial hidden status
     */
    this.toggleDisplay = function(widget, json, whenValueSet) {
        var tp = widget.findParentByType('tabpanel').getId();
        var hasContent = temp[widget.getId()] !== undefined && temp[widget.getId()].length > 0;
        var js = hasContent ? temp[widget.getId()] : json;

        for (var i = 0; i < js.length; i++) {
            for (var key in js[i]) {
                if (js[i].hasOwnProperty(key)) {
                    var hVal = js[i][key].hidden,
                        cVal = js[i][key].cssClass;
                    var hidden = true === hVal || 'true' === hVal;
                    if (widget.type === 'select') {
                        value = "" + widget.getValue();
                    } else {
                        var raw = widget.getRawValue(),
                            isObject = typeof raw == 'object' && raw[0] !== undefined, // handle checkbox
                            value = "" + (isObject ? raw[0] : raw);
                    }
                    if(whenValueSet === "true"){
                        if (key === value) {
                            if (hidden) {
                                continue;
                            }
                            var c = mrm.$('.' + cVal, '#' + tp);
                            if (!c.hasClass('x-hide-display')) {
                                c.addClass('x-hide-display');
                                c.css('display', 'none');
                                js[i][key].hidden = true;
                                var fieldset = CQ.Ext.getCmp(c[0].id);
                                switchEnableAllChildren(fieldset.items, false);
                            }
                        }

                    }else{
                        if (key !== value) {
                            if (hidden) {
                                continue;
                            }
                            var c = mrm.$('.' + cVal, '#' + tp);
                            if (!c.hasClass('x-hide-display')) {
                                c.addClass('x-hide-display');
                                c.css('display', 'none');
                                js[i][key].hidden = true;
                                var fieldset = CQ.Ext.getCmp(c[0].id);
                                switchEnableAllChildren(fieldset.items, false);
                            }
                        }
                    }
                }
            }
        }
        for (var i = 0; i < js.length; i++) {
            for (var key in js[i]) {
                if (js[i].hasOwnProperty(key)) {
                    var hVal = js[i][key].hidden,
                        cVal = js[i][key].cssClass;
                    var hidden = true === hVal || 'true' === hVal || undefined === hVal;
                    if (widget.type === 'select') {
                        value = "" + widget.getValue();
                    } else {
                        var raw = widget.getRawValue(),
                            isObject = typeof raw == 'object' && raw[0] !== undefined, // handle checkbox
                            value = "" + (isObject ? raw[0] : raw);
                    }
                    if(whenValueSet === "true"){
                        if (key !== value) {
                            if (!hidden) {
                                continue;
                            }
                            var c = mrm.$('.' + cVal, '#' + tp);
                            if (c.hasClass('x-hide-display')) {
                                c.removeClass('x-hide-display');
                                c.css('display', 'block');
                                js[i][key].hidden = false;
                                var fieldset = CQ.Ext.getCmp(c[0].id);
                                switchEnableAllChildren(fieldset.items, true);
                            }
                        }

                    }else{
                        if (key === value) {
                            if (!hidden) {
                                continue;
                            }
                            var c = mrm.$('.' + cVal, '#' + tp);
                            if (c.hasClass('x-hide-display')) {
                                c.removeClass('x-hide-display');
                                c.css('display', 'block');
                                js[i][key].hidden = false;
                                var fieldset = CQ.Ext.getCmp(c[0].id);
                                switchEnableAllChildren(fieldset.items, true);
                            }
                        }

                    }

                }
            }
        }
        temp[widget.getId()] = js;
    };


    this.hidePanel = function(widget, cVal){
        var tp = widget.findParentByType('tabpanel').getId();
        var c = mrm.$('.' + cVal, '#' + tp);
        if (!c.hasClass('x-hide-display')) {
            c.addClass('x-hide-display');
            c.css('display', 'none');
        }
    };




    this.disableNotEnabledWidget = function(widget, task){
        var dialog = widget.findParentByType('dialog');
        var path = dialog.initialConfig.responseScope.path;
        var AJAX = getXMLHttpObject();
        var isAllowed = false;
        if (AJAX) {
            var url = '/bin/checkcompanyconfig.json?task='+task+'&path='+path;
            AJAX.open("GET", url, false);
            AJAX.send(null);
            var response = AJAX.responseText;
            if(AJAX.readyState == 4 && AJAX.status == 200){ //success
                isAllowed = eval(response);
            }
        }

        if (!isAllowed) {
            var panel = widget.findParentByType("panel");
            for (var i = 0; i < panel.items.length; i++) {
                var item = panel.items.items[i];
                if (item.title == "Test&Target") {
                    item.setDisabled(true);
                }
            }
        }
    };

    /**
     * Switches all child components to either enabled or disabled. Start item must be of type (CQ.)Ext.util.MixedCollection
     *
     * @param items the root collection (e.g. items of a fieldset)
     * @param enable true to set children on enabled and false to disabled
     */
    function switchEnableAllChildren(items, enable) {
        if (items instanceof CQ.Ext.util.MixedCollection) {
            items.each(function(i) {
                if (i instanceof CQ.Ext.form.Field) {
                    if (enable) {
                        i.enable();
                    } else {
                        i.disable();
                    }
                } else if (i.items.getCount()) {
                    disableRecursive(i);
                }
            },this);
        }
        function disableRecursive(item) {
            item.items.each(function(i) {
                if (i instanceof CQ.Ext.Component) {
                    if (enable) {
                        i.enable();
                    } else {
                        i.disable();
                    }
                } else if (i.items instanceof CQ.Ext.util.MixedCollection) {
                    disableRecursive(i)
                }
            });
        }
    }
}
// function for position control
(function() {
    var gmwpPositionControl = new GmwpPositionControl();
    window.gmwpPositionControl = function() {
        return gmwpPositionControl;
    };
})();

function GmwpPositionControl() {
    var registered = {};
    var BG = {
        WHITE : '#ffffff',
        BLUE : '#0099FF'
    };
    var CONTROL = {
        FIELDS : 12,
        MAX_PX : 980,
        MAX_PR : 100
    };
    var UNIT = {
        PX : 'px',
        PR : 'pr'
    };

    function setBackgroundColor(element, color) {
        element.setStyle('background-color', color);
    }

    function setWhiteBackground(element) {
        setBackgroundColor(element, BG.WHITE);
    }

    function setBlueBackground(element) {
        setBackgroundColor(element, BG.BLUE);
    }

    function setBackgroundInBetween(array, ids, bg) {
        if (array.length == 2) {
            for (var i = array[0].index + 1; i < array[1].index; i++) {
                if (BG.BLUE === bg) {
                    setBlueBackground(CQ.Ext.get(ids[i]));
                } else {
                    setWhiteBackground(CQ.Ext.get(ids[i]));
                }
            }
        }
    }

    function addElement(array, id, index) {
        array.push({
            'id' : id,
            'index' : index
        });
    }

    function removeElement(array, id) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id === id) {
                i == 0 ? array.shift() : array.pop();
            }
        }
    }




    function triggerIEChangeEvt(element) {
        // workaround to trigger onchange event for ie correctly
        if (CQ.Ext.isIE) {
            element.on('click', function() {
                this.blur();
                this.focus();
            });
        }
    }

    function isDomReady(id) {
        return null != CQ.Ext.getDom(id);
    }

    function setSpinnerValueOnCheckboxChange(spinner, unit, index) {
        if (UNIT.PR === unit) {
            spinner.setValue(Math.round((CONTROL.MAX_PR / (CONTROL.FIELDS - 1)) * (index)));
        } else {
            spinner.setValue(Math.round((CONTROL.MAX_PX / (CONTROL.FIELDS - 1)) * (index)));
        }
    }

    function setSpinnerValueOnUnitChange(spinner, unit) {
        if (UNIT.PR === unit) {
            spinner.setValue(Math.round((spinner.getValue() * 100) / CONTROL.MAX_PX));
        } else {
            spinner.setValue(Math.round((spinner.getValue() / 100) * CONTROL.MAX_PX));
        }
    }

    function setPositionValues(widget, checked) {
        if (checked.length == 2) {
            var spinner = widget.findParentByType('fieldset').findByType('spinner'),
                spSpinner = spinner[0],
                wSpinner = spinner[1];
            var spSelection = spSpinner.ownerCt.findByType('selection')[0];
            var wSelection = wSpinner.ownerCt.findByType('selection')[0];

            setSpinnerValueOnCheckboxChange(spSpinner, spSelection !== undefined ? spSelection.getValue() : UNIT.PX, checked[0].index);
            setSpinnerValueOnCheckboxChange(wSpinner, wSelection !== undefined ? wSelection.getValue() : UNIT.PX, checked[1].index);
        }
    }

    function addClickListener(element, widget, currentIdx, checked) {
        element.on('click', function(e, t) {
            var o = CQ.Ext.get(t),
                id = widget.items.keys[currentIdx];
            // prevent that more than 2 checkboxes can be checked
            if (checked.length == 2 && t.checked) {
                e.preventDefault();
            } else if ((checked.length == 2 || checked.length == 1) && !t.checked) {
                if (checked.length == 1) {
                    e.preventDefault();
                } else {
                    setWhiteBackground(o.parent('#' + id));
                    setBackgroundInBetween(checked, widget.items.keys);
                    removeElement(checked, t.id);
                }
            } else if (checked.length < 2) {
                setBlueBackground(o.parent('#' + id));

                if (checked.length == 1) {
                    addElement(checked, t.id, currentIdx);
                    if (checked[0].index > currentIdx) {
                        checked.reverse();
                    }
                } else {
                    addElement(checked, t.id, currentIdx);
                }
                setBackgroundInBetween(checked, widget.items.keys, BG.BLUE);
                setPositionValues(widget, checked);
            }
        });
    }

    this.unitChange = function(widget) {
        if (!registered[widget.id]) {
            var s = widget.findParentByType('panel').findByType('spinner')[0];
            var r = widget.findByType('radio');

            if (r.length > 0 && isDomReady(r[0].id)) {
                for (var i = 0; i < r.length; i++) {
                    var el = CQ.Ext.get(r[i].id);
                    triggerIEChangeEvt(el);
                    el.on('change', function() {
                        setSpinnerValueOnUnitChange(s, widget.getValue());
                    });
                }

                registered[widget.id] = true;
            }
        }
    };

    this.init = function(widget) {
        if (!registered[widget.id]) {
            var ckbxs = widget.findByType('checkbox');
            if (ckbxs.length > 0 && isDomReady(ckbxs[0].id)) {
                registered[widget.id] = true;
                var checked = [];

                CQ.Ext.each(ckbxs, function(ckbx, idx) {
                    var el = CQ.Ext.get(ckbx.id);
                    if (el.getAttribute('checked')) {
                        setBlueBackground(el.parent('#' + widget.items.keys[idx]));
                        addElement(checked, el.getAttribute('id'), idx);
                    }
                    addClickListener(el, widget, idx, checked);
                }, this);
                setBackgroundInBetween(checked, widget.items.keys, BG.BLUE);
            }
        }
    };
}


//function to set the options disabled. This is need for the mm_1 video component
(function() {
    var gmdsDisableTabs = new GmdsDisableTabs();
    window.gmdsDisableTabs = function() {
        return gmdsDisableTabs;
    };
})();

function GmdsDisableTabs() {

    this.switchTab = function(widget, value /*, exact*/){
        var exactMatch = true;
        if (typeof (arguments[2]) == 'boolean') {
            exactMatch = arguments[2];
        }
        var optionsArray = new Array();
        var text = "";
        for (var i = 0; i < widget.options.length; i++) {
            var option = widget.options[i];
            if(option.value == value) {
                text = option.text;
            }
            optionsArray.push(option.text);

        }
        var tabPanel = widget.findParentByType("tabpanel");
        for (var i = 0; i < tabPanel.items.length; i++) {
            var item = tabPanel.items.items[i];
            if (exactMatch) {
                if(item.title == text){
                    item.setDisabled(false);
                } else if(optionsArray.contains(item.title)){
                    item.setDisabled(true);
                }
            } else {
                if(text.indexOf(item.title) >= 0){
                    item.setDisabled(false);
                } else if(optionsArray.contains(item.title)){
                    item.setDisabled(true);
                }
            }
        }
    };

    this.disableTab = function(widget, value /*, disable, exact*/){
        var disable = true;
        var exactMatch = true;
        if (typeof (arguments[2]) == 'boolean') {
            disable = arguments[2];
        }
        if (typeof (arguments[3]) == 'boolean') {
            exactMatch = arguments[3];
        }

        var tabPanel = widget.findParentByType("tabpanel");
        for (var i = 0; i < tabPanel.items.length; i++) {
            var item = tabPanel.items.items[i];
            if (exactMatch && item.title == value) {
                item.setDisabled(disable);
            } else if(value.indexOf(item.title) >= 0) {
                item.setDisabled(disable);
            }
        }
    };

    this.disableNotAuthorizedTabs = function(widget){
        var AJAX = getXMLHttpObject();
        var isAllowed = false;
        if (AJAX) {
            var url = '/bin/pagepropertiesloader.json?areTagTabsEnabled=true';
            AJAX.open("GET", url, false);
            AJAX.send(null);
            var response = AJAX.responseText;
            if(AJAX.readyState == 4 && AJAX.status == 200){ //success
                isAllowed = eval(response);
            }
        }

        if (!isAllowed) {
            var tabPanel = widget.findParentByType("tabpanel");
            for (var i = 0; i < tabPanel.items.length; i++) {
                var item = tabPanel.items.items[i];
                if (	(item.title == "Omniture") ||
                    (item.title == "Psyma") ||
                    (item.title == "DART Tagging") ||
                    (item.title == "eDX") ||
                    (item.title == "Netmining") ||
                    (item.title == "Marketing Tools") ||
                    (item.title == "Search Ignite") ||
                    (item.title == "Test&Target")) {
                    item.setDisabled(true);
                }
            }
        }
    };

    this.disableNotEnabledTabs = function(widget, task){
        var dialog = widget.findParentByType('dialog');
        var path = dialog.initialConfig.responseScope.path;
        var AJAX = getXMLHttpObject();
        var isAllowed = false;
        if (AJAX) {
            var url = '/bin/checkcompanyconfig.json?task='+task+'&path='+path;
            AJAX.open("GET", url, false);
            AJAX.send(null);
            var response = AJAX.responseText;
            if(AJAX.readyState == 4 && AJAX.status == 200){ //success
                isAllowed = eval(response);
            }
        }

        if (!isAllowed) {
            var tabPanel = widget.findParentByType("tabpanel");
            for (var i = 0; i < tabPanel.items.length; i++) {
                var item = tabPanel.items.items[i];
                if (item.title == "Test&Target") {
                    item.setDisabled(true);
                }
            }
        }
    };
}


//
(function() {
    var gmdsBrightcovePlaylist = new GmdsBrightcovePlaylist();
    window.gmdsBrightcovePlaylist = function() {
        return gmdsBrightcovePlaylist;
    };
})();

function GmdsBrightcovePlaylist(){
    this.getBrightcovePlaylists = function(widget, path) {
        widget.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/brightcove_playlist.json?resPath='+path, type:'GET', cache :false}).responseText));
    }
    this.setBrightcovePlaylist = function(widget, id){
        var url = widget.container.dom.ownerDocument.location.pathname;
        var brightcoveVideoDropdown;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (item.name == './brightcoveVideoId') {
                brightcoveVideoDropdown = item;
                break;
            }
        }
        brightcoveVideoDropdown.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/brightcove_playlist.json?id=' + id + '&url=' +url, type:'GET', cache :false}).responseText));
    }

    this.getBrightcovePlaylist = function(widget) {
        var url = widget.container.dom.ownerDocument.location.pathname;
        var videoId;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (item.name == './brightcovePlaylistId') {
                videoId = item.value;
                break;
            }
        }
        return(eval(mrm.$.ajax({async:false, url: '/bin/brightcove_playlist.json?id=' + videoId+ '&url=' +url, type:'GET', cache :false}).responseText));

    }

    this.setBrightcovePlaylistT07b = function(widget, id){
        var url = widget.container.dom.ownerDocument.location.pathname;
        var brightcoveVideoDropdown;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (item.name == './brightcoveVideoId') {
                brightcoveVideoDropdown = item;
                break;
            }
        }
        var options = eval(mrm.$.ajax({async:false, url: '/bin/brightcove_playlist.json?id=' + id + '&url=' +url, type:'GET', cache :false}).responseText);
        if (options.length > 0){
            options[0].text="none";
            options[0].text_xss = "none";
            options[0].value = "";
        }
        brightcoveVideoDropdown.setOptions(options);
    }

    this.getBrightcovePlaylistT07b = function(widget) {
        var url = widget.container.dom.ownerDocument.location.pathname;
        var videoId;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (item.name == './brightcovePlaylistId') {
                videoId = item.value;
                break;
            }
        }
        var options = eval(mrm.$.ajax({async:false, url: '/bin/brightcove_playlist.json?id=' + videoId+ '&url=' +url, type:'GET', cache :false}).responseText);
        if (options.length > 0){
            options[0].text="none";
            options[0].text_xss = "none";
            options[0].value = "";
        }
        return options;

    }

}


//
(function() {
    var gmdsYouTubePlaylist = new GmdsYouTubePlaylist();
    window.gmdsYouTubePlaylist = function() {
        return gmdsYouTubePlaylist;
    };
})();

function GmdsYouTubePlaylist() {
    this.getYouTubePlaylists = function(widget, path) {
        widget.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/youtube_playlist.json?resPath=' + path, type:'GET', cache :false}).responseText));
    }

    this.setYouTubePlaylist = function(widget, id){
        var youTubeVideoDropdown;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (item.name == './youtubeVideoId') {
                youTubeVideoDropdown = item;
                break;
            }
        }
        youTubeVideoDropdown.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/youtube_playlist.json?id=' + id, type:'GET', cache :false}).responseText));
    }

    this.getYouTubeUserName = function(widget) {
        var defaultName = eval(mrm.$.ajax({async:false, url: '/bin/youtubeconfiguration.json?pagePath=' + CQ.WCM.getPagePath(), type:'GET', cache :false}).responseText);
        if (widget.getValue() == '') {
            widget.defaultValue = defaultName[0].username;
            gmdsYouTubePlaylist().setYouTubePlaylists(widget, defaultName[0].username);
        }
    }

    this.getYouTubePlaylist = function(widget) {
        var videoId;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (item.name == './youtubePlaylist' && !item.disabled && item.value !== undefined) {
                videoId = item.value;
                break;
            }
        }
        return(eval(mrm.$.ajax({async:false, url: '/bin/youtube_playlist.json?id=' + videoId , type:'GET', cache :false}).responseText));

    }

    this.setYouTubePlaylists = function(widget, id){
        var url = widget.container.dom.ownerDocument.location.pathname;
        var youtubePlaylistDropdown;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (item.name == './youtubePlaylist' && item.itemId != 'x-youtube-playlistid-item') {
                youtubePlaylistDropdown = item;
                break;
            }
        }
        youtubePlaylistDropdown.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/youtube_playlist.json?user=' + id+'&url='+url, type:'GET', cache :false}).responseText));
    }

    this.getElementByName = function(widget, name){
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (item.name == name) {
                return item;
            }
        }
    }

    this.setYouTubePlaylistT07 = function(widget, id){
        var youTubeVideoDropdown;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (item.name == './youtubeVideoId') {
                youTubeVideoDropdown = item;
                break;
            }
        }
        var options= eval(mrm.$.ajax({async:false, url: '/bin/youtube_playlist.json?id=' + id, type:'GET', cache :false}).responseText);
        if (options.length > 0){
            options[0].text="none";
            options[0].text_xss = "none";
            options[0].value = "";
        }
        youTubeVideoDropdown.setOptions(options);
    }
}


//
(function() {
    var gmdsComponentCntFtC1Dialog = new GmdsComponentCntFtC1Dialog();
    window.gmdsComponentCntFtC1Dialog = function() {
        return gmdsComponentCntFtC1Dialog;
    };
})();

function GmdsComponentCntFtC1Dialog() {
    this.getCategory = function(widget, path) {
        widget.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/component_cnt_ft_c1_dialog.json?type=getCategory&resource=' + path, type:'GET', cache :false}).responseText));
    }

    this.setTags = function(widget, feed_url, category){
        var tag;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (item.name == './tag') {
                tag = item;
                break;
            }
        }
        if(feed_url == '') {
            for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
                var item = widget.ownerCt.items.items[i];
                if (item.name == './feed_url') {
                    feed_url = item.getValue();
                    break;
                }
            }
        }
        tag.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/component_cnt_ft_c1_dialog.json?type=setTags&category=' + escape(category) + '&feed_url=' + feed_url, type:'GET', cache :false}).responseText));
    }


    this.getTag = function(widget, path) {
        widget.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/component_cnt_ft_c1_dialog.json?type=getTag&resource=' + escape(path), type:'GET', cache :false}).responseText));
    }

    this.setCategories = function(widget, feed_url){
        var url = widget.container.dom.ownerDocument.location.pathname;
        var category;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (item.name == './category') {
                category = item;
                break;
            }
        }
        category.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/component_cnt_ft_c1_dialog.json?type=setCategories&feed_url=' + feed_url, type:'GET', cache :false}).responseText));
    }
}

//function to determine whether title of existing in page props can be edited
(function() {
    var gmdsAccessPrivileges = new GmdsAccessPrivileges();
    window.gmdsAccessPrivileges = function() {
        return gmdsAccessPrivileges;
    };
})();

function GmdsAccessPrivileges() {
    this.setTitleEditable = function(widget) {
        var AJAX = getXMLHttpObject();
        if (AJAX) {
            var url = '/bin/pagepropertiesloader.json?widget=titletextfield';
            AJAX.open("GET", url, false);
            AJAX.send(null);
            var response = AJAX.responseText;
            if(AJAX.readyState == 4 && AJAX.status == 200){ //success
                var array = eval(response);
                if (!array[0].canEdit) {
                    widget.setDisabled(true);
                }
            } else { //failure
                widget.setDisabled(true);
            }
        } else {
            widget.setDisabled(true);
        }
    }
}

//function to return the bbc reference as a default value for a pathfield
(function() {
    var gmdsBbcRef = new GmdsBBCRef();
    window.gmdsBbcRef = function() {
        return gmdsBbcRef;
    }
})();

function GmdsBBCRef(){
    this.setBbcRef = function(widget, path){
        if(!widget.getValue()){
            var AJAX = getXMLHttpObject();
            if (AJAX) {
                var url = '/bin/bbcref.json?path=' + CQ.WCM.getPagePath();
                AJAX.open("GET", url, false);
                AJAX.send(null);
                var response = AJAX.responseText;
                var responsevalue;
                if(AJAX.readyState == 4 && AJAX.status == 200){ //success
                    responsevalue = eval(response);
                    widget.setValue(responsevalue);
                }
            }
            var seriesCodesDropdown;
            for(var i = 0; i < widget.ownerCt.items.items.length; i++){
                var item = widget.ownerCt.items.items[i];
                if(item.name == './mmc'){
                    seriesCodesDropdown = item;
                    break;
                }
            }
            seriesCodesDropdown.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/bbcrefseriescodes.json?bbcref=' + responsevalue, type:'GET', cache :false}).responseText));
        }
    };
    this.setSeriesCodes = function(widget, bbcref){
        var seriesCodesDropdown;
        for(var i = 0; i < widget.ownerCt.items.items.length; i++){
            var item = widget.ownerCt.items.items[i];
            if(item.name == './mmc'){
                seriesCodesDropdown = item;
                break;
            }
        }
        seriesCodesDropdown.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/bbcrefseriescodes.json?bbcref=' + bbcref, type:'GET', cache :false}).responseText));
    };
    this.updateGenericSortableMultiGrid = function(widget, panelname, gridname){
        var multiGridWidget;
        var panel;
        var bbcref;
        var tabpanel = widget.findParentByType('tabpanel');

        //get the bbcreference used in this component
        for(var i = 0; i < widget.ownerCt.items.items.length; i++){
            var item = widget.ownerCt.items.items[i];
            if(item.name == './ddpref'){
                bbcref = item.value;
                break;
            }
        }
        //find the corresponding panel the multigrid is in
        for(var i = 0; i < tabpanel.items.items.length; i++){
            var item = tabpanel.items.items[i];
            if(item.name == panelname){
                panel = item;
                break;
            }
        }
        //find the multigrid we need to update
        for(var i = 0; i < panel.items.items.length; i++){
            var item = panel.items.items[i];
            if(item.name == gridname){
                multiGridWidget = item;
                break;
            }
        }

        var oldParams = multiGridWidget.queryParams;
        //the baseball card ref and series code is need to pull the right json
        var paramStr = '&seriesCode=' + widget.getValue() + '&bbcref=' + bbcref + '&widgetname=' + gridname;
        multiGridWidget.queryParams += paramStr;
        multiGridWidget.updateStoreData();
        multiGridWidget.queryParams = oldParams;

    };
}


// function to return configured 301 redirects associated with the current page when the Show 
// Redirects button is clicked in the Page tab of the Sidekick
(function() {
    var gmdsShowRedirects = new GmdsShowRedirects();
    window.gmdsShowRedirects = function() {
        return gmdsShowRedirects;
    }
})();

function GmdsShowRedirects(){
    // Sub function to return pages that the current page is configured to redirect to.
    // Called from the showredirects.xml dialog within globalpage.
    this.showRedirectsForThisPage = function(widget){
        var path = CQ.WCM.getPagePath();
        var AJAX = getXMLHttpObject();
        if (AJAX) {
            // Call ShowRedirectsServlet to get a list of pages.
            var url = '/bin/show_redirects.json?action=getRedirectsForThisPage&path=' + path;
            AJAX.open("GET", url, false);
            AJAX.send(null);
            var response = AJAX.responseText;
            if(AJAX.readyState == 4 && AJAX.status == 200){ //success
                widget.setText(response, false);
            }
        }
    };
    // Sub function to return pages that are configured to redirect to the current page.
    // Called from the showredirects.xml dialog within globalpage.
    this.showRedirectsToThisPage = function(widget){
        var path = CQ.WCM.getPagePath();
        var AJAX = getXMLHttpObject();
        if (AJAX) {
            // Call ShowRedirectsServlet to get a list of pages.
            var url = '/bin/show_redirects.json?action=getRedirectsToThisPage&path=' + path;
            AJAX.open("GET", url, false);
            AJAX.send(null);
            var response = AJAX.responseText;
            if(AJAX.readyState == 4 && AJAX.status == 200){ //success
                widget.setText(response, false);
            }
        }
    };
}


//function to set the (dynamic) colors (delivered from a servlet) for a dropdown
(function() {
    var gmdsColorOpts = new GmdsColorOpts();

    window.gmdsColorOpts = function() {
        return gmdsColorOpts;
    };

    function GmdsColorOpts() {
        this.setColorOptions = function(widget, path, pickertype) {
            // Sets the options for the color dropdown by doing a synchron AJAX request.
            // We have to do this manually because Ext Js does not support synchron
            // AJAX requests and jQuery is not available in the Site Admin.
            // This has to be synchron because the response of the servlet is essential
            // for the proper rendering of the dropdown.

            // response in case of failures
            var errorResponse = [{'value':'','text':'ERROR LOADING COLORS'}];

            //do the synchron AJAX request and set the options on success
            var AJAX = getXMLHttpObject();
            if (AJAX) {
                var url = '/bin/pagepropertiesloader.json?widget=' + pickertype + '&path=' + escape(path);
                AJAX.open("GET", url, false);
                AJAX.send(null);
                var response = AJAX.responseText;
                if(AJAX.readyState == 4 && AJAX.status == 200){ //success
                    widget.setOptions(eval(response));
                } else{ //failure
                    widget.setOptions(errorResponse);
                }
            } else {
                widget.setOptions(errorResponse);
            }
        },
            this.getColorOptions = function(path, pickertype) {
                // response in case of failures
                var errorResponse = [{'value':'','text':'ERROR LOADING COLORS'}];

                //do the synchron AJAX request and set the options on success
                var AJAX = getXMLHttpObject();
                if (AJAX) {
                    var url = '/bin/pagepropertiesloader.json?widget=' + pickertype + '&path=' + escape(path);
                    AJAX.open("GET", url, false);
                    AJAX.send(null);
                    var response = AJAX.responseText;
                    if(AJAX.readyState == 4 && AJAX.status == 200){ //success
                        return (eval(response));
                    } else{ //failure
                        return (errorResponse);
                    }
                } else {
                    return (errorResponse);
                }
            },
            this.getTextColorOptionsFromCompany = function(path) {
                // response in case of failures
                var errorResponse = [{'value':'','text':'ERROR LOADING COLORS'}];

                //do the synchron AJAX request and set the options on success
                var AJAX = getXMLHttpObject();
                if (AJAX) {
                    var url = escape(path) + 'text-colors-options.json'; //'/bin/pagepropertiesloader.json?widget=' + pickertype + '&path=' + escape(path);
                    AJAX.open("GET", url, false);
                    AJAX.send(null);
                    var response = AJAX.responseText;
                    if(AJAX.readyState == 4 && AJAX.status == 200){ //success
                        return (eval(response));
                    } else{ //failure
                        return (errorResponse);
                    }
                } else {
                    return (errorResponse);
                }
            },
            this.getButtonColorOptionsFromCompany = function(path) {
                // response in case of failures
                var errorResponse = [{'value':'','text':'ERROR LOADING COLORS'}];

                //do the synchron AJAX request and set the options on success
                var AJAX = getXMLHttpObject();
                if (AJAX) {
                    var url = escape(path) + 'button-colors-options.json'; //'/bin/pagepropertiesloader.json?widget=' + pickertype + '&path=' + escape(path);
                    AJAX.open("GET", url, false);
                    AJAX.send(null);
                    var response = AJAX.responseText;
                    if(AJAX.readyState == 4 && AJAX.status == 200){ //success
                        return (eval(response));
                    } else{ //failure
                        return (errorResponse);
                    }
                } else {
                    return (errorResponse);
                }
            };
    }
})();

// function to check two dates against each other, for now only before
(function() {
    var gmdsCheckDates= new GmdsCheckDates();
    window.gmdsCheckDates = function() {
        return gmdsCheckDates;
    };
})();

function GmdsCheckDates() {
    var date = null, val = null;
    var process = function(widget, against) {
        // second argument equals string (name of widget)
        if (typeof against === 'string') {
            date = widget.dateValue;
            for (var i = 0; i < widget.ownerCt.items.length; i++) {
                var item = widget.ownerCt.items.items[i];
                if (item.name === against) {
                    val = item.getValue();
                    break;
                }
            }
        } else {
            // second argument equals 2-dimensional array (names of widget)
            for (var i = 0; i < widget.ownerCt.items.length; i++) {
                var item = widget.ownerCt.items.items[i];
                if (item.name === against[0]) {
                    date = item.getValue();
                }
                if (item.name === against[1]) {
                    val = item.getValue();
                }
                if (null != val && null != date) {
                    break;
                }
            }
        }
    };
    // check whether date is before the the passed date
    this.before = function(widget, against) {
        process(widget, against);
        if (null != val && null != date && date < val) {
            return true;
        }
        return false;
    }
    // check whether date is after the the passed date
    this.after = function(widget, against) {
        process(widget, against);
        if (null != val && null != date && date > val) {
            return true;
        }
        return false;
    }
}

// function for whether prohibiting an event to fire on an element or not
(function() {
    var gmdsProhibitEvent = new GmdsProhibitEvent();
    window.gmdsProhibitEvent = function() {
        return gmdsProhibitEvent;
    };
})();

function GmdsProhibitEvent() {
    var enabled = false, prohibit = false;
    // sets the prohibit variable
    this.setProhibit = function(/*prohibit*/) {
        if (typeof arguments[0] === 'boolean') {
            prohibit = arguments[0];
        } else {
            // if no parameter has been passed
            prohibit = true;
        }
    }
    // sets the enabled variable
    this.setEnabled = function(/*value, values*/) {
        if (typeof arguments[0] === 'string' && typeof arguments[1] === 'object') {
            // if called with string and array
            var isInArray = mrm.$.inArray(arguments[0], arguments[1]);
            if(isInArray > -1){
                enabled = true;
            } else {
                enabled = false;
            }
        } else {
            // if no parameter has been passed
            enabled = true;
        }
    }
    // fire an event on the dialog (element)
    this.onDialog = function(widget, event /*, message*/) {
        var message = arguments[2];
        dialog = widget.findParentByType('dialog');
        dialog.on(event, function() {
            if (enabled && prohibit) {
                if (typeof message === 'string') {
                    CQ.Ext.Msg.show({
                        title: CQ.I18n.getMessage('Warning'),
                        msg: CQ.I18n.getMessage(message),
                        buttons: CQ.Ext.Msg.OK,
                        icon: CQ.Ext.Msg.WARNING
                    });
                }
                return false;
            }
            return true;
        });
    }
}

//function to check if the vanity path in the dialog is already within country subtree. 
(function() {
    var gmdsVanityPathChecker = new GmdsVanityPathChecker();
    window.gmdsVanityPathChecker = function() {
        return gmdsVanityPathChecker;
    };
})();

function GmdsVanityPathChecker() {
    var vanityPath = "";
    var dialog = undefined;

    this.setVanityPath = function(paraVanityPath) {
        vanityPath = paraVanityPath;
    }

    this.checkVanityPath = function(widget) {
        vanityPath = widget.value;
        dialog = widget.findParentByType('dialog');
        dialog.on("beforesubmit", function(){
            if (vanityPath == undefined) {
                vanityPath = widget.value;
            }
            var vanityPathAlreadyExists = true;
            var duplicateVanityPath = "";
            var AJAX = getXMLHttpObject();
            if (AJAX) {
                var url = '/bin/pagepropertiesloader.json?checkVanityPath=' + encodeURIComponent(vanityPath) + "&path=" + encodeURIComponent(dialog.path);
                AJAX.open("GET", url, false);
                AJAX.send(null);
                var response = AJAX.responseText;
                if(AJAX.readyState == 4 && AJAX.status == 200){ //success
                    duplicateVanityPath = response;
                    vanityPathAlreadyExists = !((duplicateVanityPath == undefined) || (duplicateVanityPath == ""));
                }
            }

            if (vanityPathAlreadyExists && duplicateVanityPath != undefined && duplicateVanityPath != "") {
                alert('Vanity Path ' + vanityPath + ' already exists in path ' + duplicateVanityPath + '.');
                return false;
            } else {
                return true;
            }
        });
    };
}


//function to fix the RTL behavior in the RichText editor
(function() {
    var gmdsRichEditRtlFix = new GmdsRichEditRtlFix();
    window.gmdsRichEditRtlFix = function() {
        return gmdsRichEditRtlFix;
    };
})();

function GmdsRichEditRtlFix() {
    this.applyFix = function(panel) {
        document.myTestPanel = panel;
        // Check whether we are on a right-to-left-page:
        try {
            var dir = document.getElementsByTagName("html")[0].getAttribute("dir");
            if (!dir || dir != "rtl") {
                return;
            }
        } catch (err) {
            return;
        }

        for (var i = 0; ; i++) {
            var element = panel.items.get(i);
            if (null == element) {
                break;
            }
            if ("richtext" != element.xtype) { continue; }
            if (!element.el) { continue; }
            if (!element.el.dom) { continue; }
            if (!element.el.dom.tagName) { continue; }
            if ("textarea" != element.el.dom.tagName.toLowerCase()) { continue; }
            if (!element.el.dom.nextSibling) { continue; }
            if (!element.el.dom.nextSibling.firstChild) { continue; }
            if (!element.el.dom.nextSibling.firstChild.contentDocument) { continue; }
            if (!element.el.dom.nextSibling.firstChild.contentDocument.firstChild) { continue; }
            if (!element.el.dom.nextSibling.firstChild.contentDocument.firstChild.tagName) { continue; }
            if ("html" != element.el.dom.nextSibling.firstChild.contentDocument.firstChild.tagName.toLowerCase()) { continue; }
            // made it down here? That really seems to be a <html> element in an richtext iframe.
            try {
                element.el.dom.nextSibling.firstChild.contentDocument.firstChild.setAttribute("dir", "rtl");
            } catch (err) {
                continue;
            }
        }
    }
}

//function to set the available numbers of icons for the dropdown of the ut_ln_share_c1
(function() {
    var gmdsShareNumberOfIcons = new GmdsShareNumberOfIcons();
    window.gmdsShareNumberOfIcons = function() {
        return gmdsShareNumberOfIcons;
    };
})();

function GmdsShareNumberOfIcons() {
    this.setShareOptions = function(widget, path /*, onFly*/) {
        if (arguments[2] !== undefined && arguments[2] === true) {
            for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
                var item = widget.ownerCt.items.items[i];
                if (item.name == './numberOfIcons') {
                    var val = widget.getValue();
                    if (val.length === 0) {
                        var json = "[{value:\"0\", text:\"none\"}," +
                            "{value:\"1\", text:\"1\"}," +
                            "{value:\"2\", text:\"2\"}," +
                            "{value:\"3\", text:\"3\"}," +
                            "{value:\"4\", text:\"4\"}]";
                        item.setOptions(eval(json));
                    } else {
                        var maxLoop = val.split(",").length <= 4 ? val.split(",").length : 4;
                        var json = "[";
                        for (var j = 0; j <= maxLoop; j++) {
                            var text = j === 0 ? "none" : j;
                            json = json + "{value:'" + j + "', text:'" + text + "'}";
                            if (j !== maxLoop) {
                                json = json + ",";
                            }
                        }
                        json = json + "]";
                        item.setOptions(eval(json));
                    }
                    break;
                }
            }
        } else {
            widget.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/component_ut_ln_share_c1_dialog.json?path=' + path, type:'GET', cache :false}).responseText));
        }
    }
}


//The GmdsDialogTabSwitch is used for the DialogTabSwitch or hide a tab depending on the selection of a checkbox.
function GmdsDialogTabSwitch(selectionWidget, tabPanel, dependentTabs, dependentTabSwitches) {
    this.selectionWidget = selectionWidget;
    this.tabPanel = tabPanel;
    this.dependentTabs = dependentTabs;
    this.dependentTabSwitches = dependentTabSwitches;
    this.activateOnTabSwitch = false;

    for(tabValue in this.dependentTabs) {
        if(this.dependentTabs[tabValue] > -1) {
            this.tabPanel.hideTabStripItem(this.dependentTabs[tabValue]);
        }
    }
}

GmdsDialogTabSwitch.initialize = function(widget, options) {
    if(options.identifier == undefined) {
        options.identifier = 'default';
    }
    tabPanel = widget.findParentByType('tabpanel');
    if(tabPanel.dialogTabSwitch == undefined) {
        tabPanel.dialogTabSwitch = new Object();
    }
    tabPanel.dialogTabSwitch[options.identifier] = new GmdsDialogTabSwitch(widget, tabPanel, options.dependentTabs, options.dependentTabSwitches);
}

GmdsDialogTabSwitch.switchDialogTab = function(widget, value, identifier) {
    if(identifier == undefined) {
        identifier = 'default';
    }
    dialogTabSwitch = widget.findParentByType('tabpanel').dialogTabSwitch[identifier];
    dialogTabSwitch.doSwitchDialogTab(value);
}

GmdsDialogTabSwitch.prototype.doSwitchDialogTab = function(value) {
    for(tabValue in this.dependentTabs) {
        if(this.dependentTabs[tabValue] > -1) {
            if(tabValue == value) {
                if(this.activateOnTabSwitch) {
                    this.tabPanel.activate(tabPanel.items.get(this.dependentTabs[tabValue]));
                } else {
                    this.activateOnTabSwitch = true;
                }
                this.tabPanel.unhideTabStripItem(this.dependentTabs[tabValue]);
            } else {
                this.tabPanel.hideTabStripItem(this.dependentTabs[tabValue]);
            }
        }
    }

    for(tabSwitchValue in this.dependentTabSwitches) {
        if(value == tabSwitchValue) {
            tabSwitchTabId = this.dependentTabSwitches[tabSwitchValue];
            tabSwitch = this.tabPanel.dialogTabSwitch[tabSwitchTabId];
            if(tabSwitch) {
                tabSwitch.doSwitchDialogTab(tabSwitch.selectionWidget.getValue());
            }
        }
    }
}

function getBodystyleDialogText(widget){

    var parent = widget.findParentByType('dialog');

    if(parent != null){
        var path = parent.responseScope.path;
        var id = "div[id*='"+path+"']";
        var attributeInformation = jQuery(id);

        if(attributeInformation != null){
            widget.update(attributeInformation[0].innerHTML);
        }
    }

}

// function to provide additional functionality for selections
(function() {
    var gmdsSelectionHelper = new GmdsSelectionHelper();
    window.gmdsSelectionHelper = function() {
        return gmdsSelectionHelper;
    };
})();

function GmdsSelectionHelper() {
    /**
     * Selects the first entry of the dropdown by default.
     */
    this.selectFirstAsDefault = function(widget) {
        if (widget.getValue && !widget.getValue()) {
            if (widget.comboBox && widget.comboBox.getStore) {
                var store = widget.comboBox.getStore();
                if (store) {
                    var first = store.getAt(0);
                    if (first && first.data && 'value' in first.data) {
                        widget.setValue(first.data.value);
                        widget.fireEvent(CQ.form.Selection.EVENT_SELECTION_CHANGED,
                            widget, first.data.value, true);
                    }
                }
            }
        }
    };

    /**
     * Selects a radio button entry by default.
     */
    this.setRadioDefault = function(widget, value) {
        if (widget.isRadio) {
            if (widget.getValue && !widget.getValue()) {
                widget.setValue(value);
            }
        }
    }
};

(function() {
    var gmdsSocialFeedDefaultAttributes = new GmdsSocialFeedDefaultAttributes();
    window.gmdsSocialFeedDefaultAttributes = function() {
        return gmdsSocialFeedDefaultAttributes;
    };
})();

function GmdsSocialFeedDefaultAttributes(){
    this.selectDefaultFromCompanyTemplate = function(widget, service, field){
        if(!widget.getValue()){
            var AJAX = getXMLHttpObject();
            if (AJAX) {
                var url = '/bin/social-feed-default-attributes.json?service=' + service + '&path=' + CQ.WCM.getPagePath() + '&field=' + field;
                AJAX.open("GET", url, false);
                AJAX.send(null);
                var responsevalue;
                if(AJAX.readyState == 4 && AJAX.status == 200){ //success
                    var response = AJAX.responseText;
                    if(typeof response === "undefined"){
                        gmdsSelectionHelper().selectFirstAsDefault(widget);
                    }else{
                        widget.setValue(response);
                    }
                }
            }
        }
    }
}


//function to provide additional functionality for dom operations
(function() {
    var gmdsDOMHelper = new GmdsDOMHelper();
    window.gmdsDOMHelper = function() {
        return gmdsDOMHelper;
    };
})();

function GmdsDOMHelper() {

    /**
     * Returns the a parent node of a certain type.
     */
    this.getParentNode = function(widget, type) {
        var widget = this.getParent(widget, type);
        if (widget && widget.id) {
            return CQ.Ext.get(widget.id);
        }
    };

    /**
     * Returns a parent widget of a certain type
     */
    this.getParent = function(widget, type) {
        if (widget) {
            return widget.findParentByType(type);
        }
    };

    /**
     * Changes the visibility of an html element that is specified by its id.
     * @param id id of an html element
     * @param visible if true, widget is displayed, if false, widget is hidden
     */
    this.setVisible = function(id, visible) {
        if (id) {
            var elt = CQ.Ext.get(id);
            if (elt) {
                if (visible) {
                    elt.removeClass('x-hide-display');
                    elt.setStyle('display', 'block');
                    var widget = CQ.Ext.getCmp(id);
                    if (widget && widget.doLayout) {
                        widget.doLayout();
                    }
                } else {
                    elt.addClass('x-hide-display');
                    elt.setStyle('display', 'none');
                }
            }
        }
    };

    /**
     * Changes the visibility of one or more html elements that are specified by
     * a css class.
     * In case of the rich text editor the whole rich text editor including label will be hidden.
     * @param cls css class of nodes
     * @param parent parent node
     * @param visible if true, widget is displayed, if false, widget is hidden
     */
    this.setVisibleByClass = function(cls, parent, visible) {
        var nodes = this._getNodesByClass(cls, parent);
        for (var i=0; i<nodes.length; i++) {
            var node = nodes[i];
            if(jQuery(node).parent().hasClass('x-html-editor-wrap')){
                node = node.parentNode.parentNode.parentNode;
            }
            this.setVisible(node.id, visible);
        }
    };

    /**
     * Changes the visibility of one or more html elements that are ancestors of elements specified
     * by a css class, where relativeLevel determines how many levels up to go.
     * @param cls css class of nodes
     * @param parent parent node
     * @param visible if true, widget is displayed, if false, widget is hidden
     * @param relativeLevel
     */
    this.setAncestorVisibleByClass = function(cls, parent, visible, relativeLevel) {
        var nodes = this._getNodesByClass(cls, parent);
        for (var i=0; i<nodes.length; i++) {
            var node = nodes[i];
            if(jQuery(node).parent().hasClass('x-html-editor-wrap')){
                node = node.parentNode.parentNode.parentNode;
            }
            for (var j=0; j<relativeLevel; j++) {
                node = node.parentNode;
            }
            this.setVisible(node.id, visible);
        }
    };

    /**
     * Returns a widget on a node below parent, which is marked by a css class.
     * If several widgets should be found, the first one is returned.
     * @param cls css class of widget
     * @param parent parent node
     */
    this.findWidgetByClass = function(cls, parent) {
        var nodes = this._getNodesByClass(cls, parent);
        if (nodes.length > 0) {
            return CQ.Ext.getCmp(nodes[0].id);
        }
    };

    /**
     * Returns a list of widgets on a node below parent, which are marked by a css class.
     *
     * @param cls css class of widget
     * @param parent parent node
     */
    this.findWidgetsByClass = function(cls, parent) {
        var nodes = this._getNodesByClass(cls, parent);
        var widgets = [];
        for (var i=0; i<nodes.length;i++) {
            if (nodes[i].id) {
                widgets.push(CQ.Ext.getCmp(nodes[i].id));
            }
        }
        return widgets;
    };

    /**
     * Returns a list of dom nodes below the parent node, which have the
     * css class cls.
     * @param cls css class
     * @param parent parent node
     */
    this._getNodesByClass = function(cls, parent) {
        if (cls && parent) {
            if (parent.dom) {
                parent = parent.dom;
                return CQ.Ext.DomQuery.select('.'+cls, parent);
            }
        }
        return [];
    }

    /**
     * The method hides all tabs with a specific CSS class.
     * @param cls the Css class of the tab
     * @param widget the widget
     * @param hide true if the tab should be hidden, false otherwise
     */
    this.hideTabs = function(widget, cls, hide){
        var parent = this.getParentNode(widget, 'tabpanel');
        var tabs = this.findWidgetsByClass(cls, parent);
        for(var i=0; i< tabs.length; i++){
            tabs[i].setDisabled(hide);
        }
    }
};

//function to help in toggling tabs for the masthead configuration.
(function() {
    var gmdsMastheadHelper = new GmdsMastheadHelper();
    window.gmdsMastheadHelper = function() {
        return gmdsMastheadHelper;
    };
})();

function GmdsMastheadHelper(){

    this.hideOtherTabs = function(widget, hide, cls){
        var h = gmdsDOMHelper();
        var parent = h.getParentNode(widget, 'tabpanel');

        if(hide){
            var tabs = h.findWidgetsByClass(cls, parent);
            for(var i=0; i< tabs.length; i++){
                tabs[i].setDisabled(hide);
            }
        }else{
            var tabs = h.findWidgetsByClass(cls, parent);
            for(var i=0; i< tabs.length; i++){
                tabs[i].setDisabled(hide);
            }
        }
    }

}


//function to help in toggling tabs for the masthead configuration.
(function() {
    var gmdsHelpMeChoose = new GmdsHelpMeChoose();
    window.gmdsHelpMeChoose = function() {
        return gmdsHelpMeChoose;
    };
})();

function GmdsHelpMeChoose(){
    this.getMinMaxDefault = function(widget, value){

        var url = CQ.WCM.getPagePath()+".min-max-for-attribute.json?attributeId="+value;
        var response = jQuery.get(url).success(function(data){
            var h = gmdsDOMHelper();
            var parent = h.getParentNode(widget, 'tabpanel');
            var systemTextFieldWidget = h.findWidgetByClass('hmc_filter_c1_system_range', parent);
            if(data != null && data.length == 3){
                var minValue = data[0].value;
                var maxValue = data[1].value;
                var unit = data[2].value;
                var formattedSystemRange = "System range for this attribute: ("+minValue +"-"+maxValue+") ["+unit+"]";
                systemTextFieldWidget.update(formattedSystemRange);
            }else{
                systemTextFieldWidget.update("No System range available  for " + value );
            }
        });
    };

    this.hideTabsForHmcPage = function(widget){
        var url = CQ.WCM.getPagePath()+".check-page-type.json?resourceType=gmds/pages/t03c_view_all_vehicles_with_filtering";
        var response = jQuery.ajax({
            url:url,
            success:function(data){
                if(data != null && data.isRequestedType){
                    var helper = gmdsMastheadHelper();
                    helper.hideOtherTabs(widget, true,'hideable-tab-panel');
                    helper.hideOtherTabs(widget, false,'display_for_hmc_page');
                }			},
            async:false


        });
        return response;
    };
}


//function to set sharing options in gallery components
(function() {
    var gmdsGalleryShare = new GmdsGalleryShare();
    window.gmdsGalleryShare = function() {
        return gmdsGalleryShare;
    };
})();

function GmdsGalleryShare() {

    this.updateTabs = function(widget, value){
        var h = gmdsDOMHelper();
        var tabPanel = h.getParentNode(widget, 'tabpanel');
        this.disableAll(h, tabPanel);
        if (value === 'global') {
            var config = this.getGlobalShareConfig(widget);
            for (var configItem in config) {
                if (config[configItem]) {
                    var toEnable = h.findWidgetByClass('sharing_tools_toggle_'+configItem, tabPanel);
                    if (toEnable && toEnable.setDisabled) {
                        toEnable.setDisabled(false);
                    }
                }
            }
        } else {
            var tabs = h.findWidgetsByClass('sharing_tools_toggle', tabPanel);
            for (var i=0; i<tabs.length; i++) {
                if (tabs[i] && tabs[i].setDisabled) {
                    tabs[i].setDisabled(true);
                }
            }
            var toEnable = h.findWidgetByClass('sharing_tools_toggle_'+value, tabPanel);
            if (toEnable && toEnable.setDisabled) {
                toEnable.setDisabled(false);
            }
        }
    };

    this.disableAll = function(h, tabPanel) {
        var tabs = h.findWidgetsByClass('sharing_tools_toggle', tabPanel);
        for (var i=0; i<tabs.length; i++) {
            if (tabs[i] && tabs[i].setDisabled) {
                tabs[i].setDisabled(true);
            }
        }
    }

    this.enableAll = function(h, tabPanel) {
        var tabs = h.findWidgetsByClass('sharing_tools_toggle', tabPanel);
        for (var i=0; i<tabs.length; i++) {
            if (tabs[i] && tabs[i].setDisabled) {
                tabs[i].setDisabled(false);
            }
        }
    }

    this.getGlobalShareConfig = function(widget){
        var AJAX = getXMLHttpObject();
        var config = {};
        if (AJAX) {
            var url = '/bin/galleryshareconfig.json?path='+escape(CQ.WCM.getPagePath());
            AJAX.open("GET", url, false);
            AJAX.send(null);
            var response = AJAX.responseText;
            if(AJAX.readyState == 4 && AJAX.status == 200){ //success
                config = CQ.Ext.decode(response);
            }
        }

        return config;
    };

    selectionchanged=function(widget, value) {
        var h = gmdsDOMHelper();
        var parent = h.getParentNode(widget, 'tabpanel');
        if(value === 'story_scroller'){
            h.setVisibleByClass('x-panel-story-scroller', parent, true);
            h.setVisibleByClass('x-panel-standard-image', parent, false);

            var tabs = h.findWidgetsByClass('hideable-tab-panel', parent);
            tabs[0].setDisabled(true);

            for(var tab in tabs){
                tab.setDisabled(true);
            }

            //h.setVisibleByClass('tab-combined-flash-panel', parent, false);

        }else if(value === 'standard'){
            h.setVisibleByClass('x-panel-standard-image', parent, true);
            h.setVisibleByClass('x-panel-story-scroller', parent, false);
            var tabs = h.findWidgetsByClass('hideable-tab-panel', parent);
            tabs[0].setDisabled(true);
        }
    }
}

//(hide everything except the things we make public explicitly)
(function() {

    var gmdsSeriescodes = new GmdsSeriescodes();

// this is a singleton
    window.gmdsGetSeriescodes = function () {
        return gmdsSeriescodes;
    };

    function GmdsSeriescodes() {

        this.pageName = undefined;

        this.componentPathToSeriesCodes = new Object();

        this.setPageName = function(name) {
            this.pageName = name;
        }

        this.setSeriesCodes = function(componentPath, seriesCodes) {
            this.componentPathToSeriesCodes[componentPath] = seriesCodes;
        }

        this.getSeriesCodes = function(componentPath) {

            var data = this.componentPathToSeriesCodes[componentPath];

            var json = eval(mrm.$.ajax({
                async:false,
                url : this.pageName + ".seriescodesjson.js?cp=" + escape(componentPath),
                type: "GET",
                cache: false
            }).responseText);

            return json;
        }
    }

})();

(function() {
    var gmdsGetDdpData = new GmdsGetDdpData();
    window.gmdsGetDdpData = function () {
        return gmdsGetDdpData;
    };

    function GmdsGetDdpData() {
        this.ddpDataObj = new Object();

        this.setPageName = function(name) {
            this.pageName = name;
        }

        this.getComponentPath = function() {
            return this.compPath;
        }

        this.setComponentPath = function(panel) {
            if (undefined !== panel.ownerCt.ownerCt.initialConfig.responseScope) {
                this.compPath = panel.ownerCt.ownerCt.initialConfig.responseScope.path;
            }
        }

        this.setAll = function(componentPath, bodyStyleCode, carlineCode, modelYear, seriesCode, excelFile, baseballcardPath) {
            this.ddpDataObj[componentPath] = { bsc : bodyStyleCode, clc : carlineCode, my : modelYear, sc : seriesCode, excelFile : excelFile, bbcp : baseballcardPath };
        }

        this.getAll = function(componentPath) {
            return this.ddpDataObj[componentPath];
        }

        this.getBodyStyleCode = function(componentPath) {
            return this.ddpDataObj[componentPath].bsc;
        }

        this.getCarlineCode = function(componentPath) {
            return this.ddpDataObj[componentPath].clc;
        }

        this.getModelYear = function(componentPath) {
            return this.ddpDataObj[componentPath].my;
        }

        this.getSeriesCode = function(componentPath) {
            return this.ddpDataObj[componentPath].sc;
        }

        this.initBBCDataFromVi6 = function(widget, seriesCode){

            var parent = widget.findParentByType('dialog');

            if(parent != null){
                var path = parent.responseScope.path;
                var pos = path.indexOf("jcr:content");
                var baseballcardPath = path.substring(0, pos - 1);
            }

            this.initBBCData(baseballcardPath, seriesCode);
        }

        this.initBBCData = function(baseballcardPath, seriesCode) {

            if (null !== baseballcardPath) {
                var ajaxUrl = this.pageName + ".ddpdatajson.js?bbc=" + escape(baseballcardPath);
                var optionsData = eval(mrm.$.ajax({
                    url: ajaxUrl,
                    async: false,
                    type: "GET",
                    cache: false
                }).responseText);

                if (optionsData !== undefined) {
                    this.ddpDataObj["init"] = {
                        bsc : optionsData[0].bodystyleCode,
                        clc : optionsData[0].carlineCode,
                        my : optionsData[0].modelYear,
                        excelFile: optionsData[0].excelFile,
                        bbcp: optionsData[0].bbcp
                    };
                }
            }

            if (null !== seriesCode) {
                if (this.ddpDataObj["init"] !== undefined) {
                    this.ddpDataObj["init"].sc = seriesCode;
                } else {
                    this.ddpDataObj["init"] = this.ddpDataObj[this.getComponentPath()];
                    this.ddpDataObj["init"].sc = seriesCode;
                }
            }
        }

        this.getOptionsOnInit = function() {

            if (this.ddpDataObj["init"] !== undefined) {
                if(this.ddpDataObj["init"].excelFile !== ""){// The baseballcard has an excel file, so the equipment options coming from the excel service.
                    var json = eval(mrm.$.ajax({
                        async:false,
                        url: this.pageName + ".exceloptionsjson.js?bbcp=" + this.ddpDataObj["init"].bbcp,
                        type: "GET",
                        cache: false
                    }).responseText);

                    delete this.ddpDataObj["init"];
                    return json;
                } else {
                    var json = eval(mrm.$.ajax({
                        async:false,
                        url: this.pageName + ".equipmentoptionsjson.js?bodystyleCode=" + this.ddpDataObj["init"].bsc + "&carlineCode=" + this.ddpDataObj["init"].clc + "&modelYear=" + this.ddpDataObj["init"].my + "&seriesCode=" + this.ddpDataObj["init"].sc,
                        type: "GET",
                        cache: false
                    }).responseText);

                    delete this.ddpDataObj["init"];
                    return json;
                }
            }
        }

        this.getOptionsOnExisting = function(bodystyleCode, carlineCode, modelYear, seriesCode, excelFile, baseballcardPath) {

            if(excelFile !== ""){ // The baseballcard has an excel file, so the equipment options coming from the excel service.
                return eval(mrm.$.ajax({
                    async:false,
                    url: this.pageName + ".exceloptionsjson.js?bbcp=" + baseballcardPath,
                    type: "GET",
                    cache: false
                }).responseText);
            } else {
                return eval(mrm.$.ajax({
                    async:false,
                    url: this.pageName + ".equipmentoptionsjson.js?bodystyleCode=" + bodystyleCode + "&carlineCode=" + carlineCode + "&modelYear=" + modelYear + "&seriesCode=" + seriesCode,
                    type: "GET",
                    cache: false
                }).responseText);
            }
        }
    }
})();

//function to handle visibility in the trim component dialog
(function() {
    var gmdsVisibilityUtil = new GmdsVisibilityUtil();
    window.gmdsVisibilityUtil = function () {
        return gmdsVisibilityUtil;
    };
})();
function GmdsVisibilityUtil() {

    this.setVisibility = function(widget, visibility, id){
        var item = widget.findById(id);
        item.setVisible(visibility);
    }
}

//helper function to update a genericsortablemultigrid widget
(function() {
    var gmdsGenericSortableGridHelper = new GmdsGenericSortableGridHelper();
    window.gmdsGenericSortableGridHelper = function() {
        return gmdsGenericSortableGridHelper;
    }
})();

function GmdsGenericSortableGridHelper(){

    this.enableOrDisableGridItems = function(widget, value, itemNamesToEnable, valuesWhichWillCauseEnable){
        var enable = false;
        var isInArray = mrm.$.inArray(value, valuesWhichWillCauseEnable);
        if(isInArray > -1){
            enable = true;
        }
        for (var i = 0; i < widget.ownerCt.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (mrm.$.inArray(item.name, itemNamesToEnable) > -1){
                if (enable) {
                    item.setDisabled(false);
                } else {
                    item.setDisabled(true);
                }
            }
        }
    };

    this.updateGenericSortableMultiGrid = function(widget, value, panelname, gridname, noOfDefaults, valuesWhichWillCauseReset){
        var multiGridWidget;
        var panel;
        var tabpanel = widget.findParentByType('tabpanel');
        var isInArray = mrm.$.inArray(value, valuesWhichWillCauseReset);
        if(isInArray == -1){
            reset = true;
        }
        //find the corresponding panel the multigrid is in
        for(var i = 0; i < tabpanel.items.items.length; i++){
            var item = tabpanel.items.items[i];
            if(item.name == panelname){
                panel = item;
                break;
            }
        }
        //find the multigrid we need to update
        for(var i = 0; i < panel.items.items.length; i++){
            var item = panel.items.items[i];
            if(item.name == gridname){
                multiGridWidget = item;
                break;
            }
        }

        //if the conditions for reset are true, reset the grid with default values
        if(reset){
            multiGridWidget.resetStoreData(noOfDefaults);
        }
    };
}

//(hide everything except the things we make public explicitly)
(function() {

    var showSiteMap = new showSiteMap();

// this is a singleton
    window.gmdsGetShowSiteMap = function () {
        return false;
    };

    function showSiteMap() {

        this.pageName = undefined;


    }

})();


// This is only used for the ut_js_c1 component.
(function() {
    var gmdsJavascriptParameterList = new GmdsJavascriptParameterList();
    window.gmdsJavascriptParameterList = function() {
        return gmdsJavascriptParameterList;
    };
})();

function GmdsJavascriptParameterList(){
    this.setParameterList = function(widget, value){
        var newOptions = JSON.parse(mrm.$.ajax({async:false, url: '/bin/js_parameter_list.json?configRes=' + value + '&resPath=' + CQ.WCM.getPagePath() , type:'GET', cache :false}).responseText);
        if(newOptions.length > 0) {
            // show the multifield just in case it was already hidden.
            if(widget.ownerCt.items.get('x-parameters-panel').hasClass('x-hide-display') === true) {
                widget.ownerCt.items.get('x-parameters-panel').removeClass('x-hide-display');
            }
            // check if there are any new options for parameters. If there is, change all the dropdowns' option list. set all the dropdown to be the first option.
            var allowedFieldWidgets = widget.ownerCt.items.get('x-parameters-panel').items.get('x-parameters-widget').findByType('selection');
            for(var i = 0; i < allowedFieldWidgets.length; i++) {
                var allowFieldWidget = allowedFieldWidgets[i];
                allowFieldWidget.setOptions(newOptions);
                // we want to select the first as default but override it everytime the script is changed. so this functions similarly to
                // gmdsSelectionHelper.selectFirstAsDefault. Main difference is that we will ignore the fact the value is already set and override it.
                if (allowFieldWidget.getValue) {
                    if (allowFieldWidget.comboBox && allowFieldWidget.comboBox.getStore) {
                        var store = allowFieldWidget.comboBox.getStore();
                        if (store) {
                            var first = store.getAt(0);
                            if (first && first.data && 'value' in first.data) {
                                allowFieldWidget.setValue(first.data.value);
                                allowFieldWidget.fireEvent(CQ.form.Selection.EVENT_SELECTION_CHANGED,
                                    allowFieldWidget, first.data.value, true);
                            }
                        }
                    }
                }
            }
            // no selection widgets? do nothing.
        } else {
            // no options? pop off all multifielditems. subsequently hide the panel around the multifield.
            var multifielditems = widget.ownerCt.items.get('x-parameters-panel').items.get('x-parameters-widget').findByType('multifielditem');
            for(var j = 0; j < multifielditems.length; j++) {
                var multifielditem = multifielditems[j];
                multifielditem.ownerCt.remove(multifielditem, true);
            }
            // hide the multifield if there isn't any parameters.
            if(widget.ownerCt.items.get('x-parameters-panel').hasClass('x-hide-display') === false) {
                widget.ownerCt.items.get('x-parameters-panel').addClass('x-hide-display');
            }
        }
    }

    this.getParameterList = function(widget) {
        var tabpanelwidget = widget.findParentByType('tabpanel');
        var script = tabpanelwidget.items.items[0].items.get('x-path-widget').getValue();
        return(JSON.parse(mrm.$.ajax({async:false, url: '/bin/js_parameter_list.json?configRes=' + script + '&resPath=' + CQ.WCM.getPagePath(), type:'GET', cache :false}).responseText));
    }
}

// Exterior CGI view selection for visualizer
(function() {
    var gmdsCgiExtView = new GmdsCgiExtView();
    window.gmdsCgiExtView = function() {
        return gmdsCgiExtView;
    };
})();

function GmdsCgiExtView(){

    this.setGmdsCgiExtView = function(widget, id){
        var cgiViewDropdown;
        var url = widget.container.dom.ownerDocument.location.pathname;
        var path = CQ.WCM.getPagePath();
        var extViewsDropdown;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (item.name == './extCGIView') {
                extViewsDropdown = item;
                break;
            }
        }
        var options = eval(mrm.$.ajax({async:false, url: '/bin/cgi-views-options.json?parameter=ext_cgi_views&cgiConfigName='+id+'&resPath='+path, type:'GET', cache :false}).responseText);
        extViewsDropdown.setOptions(options);
        //Set first value as default.
        extViewsDropdown.setValue(options[0].value);
        extViewsDropdown.fireEvent(CQ.form.Selection.EVENT_SELECTION_CHANGED,
            widget, options[0].value, true);
    }

    this.getGmdsCgiExtView = function(widget) {
        var extConfig;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (item.name == './extCGIConfig') {
                extConfig = "" + item.getValue();
                break;
            }
        }
        var path = CQ.WCM.getPagePath();
        widget.setOptions(eval(mrm.$.ajax({async:false, url:'/bin/cgi-views-options.json?cgiConfigName='+extConfig+'&ext_cgi_views&resPath='+path, type:'GET', cache :false}).responseText));
    }

}

//Interior CGI view selection for visualizer.
(function() {
    var gmdsCgiIntView = new GmdsCgiIntView();
    window.gmdsCgiIntView = function() {
        return gmdsCgiIntView;
    };
})();

function GmdsCgiIntView(){

    this.setGmdsCgiIntView = function(widget, id){
        var cgiViewDropdown;
        var url = widget.container.dom.ownerDocument.location.pathname;
        var path = CQ.WCM.getPagePath();
        var extViewsDropdown;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (item.name == './intCGIView') {
                extViewsDropdown = item;
                break;
            }
        }
        var options = eval(mrm.$.ajax({async:false, url: '/bin/cgi-views-options.json?cgiConfigName='+id+'&resPath='+path, type:'GET', cache :false}).responseText);
        extViewsDropdown.setOptions(options);
        //Set first value as default.
        extViewsDropdown.setValue(options[0].value);
        extViewsDropdown.fireEvent(CQ.form.Selection.EVENT_SELECTION_CHANGED,
            widget, options[0].value, true);
    }

    this.getGmdsCgiIntView = function(widget) {
        var extConfig;
        for (var i = 0; i < widget.ownerCt.items.items.length; i++) {
            var item = widget.ownerCt.items.items[i];
            if (item.name == './intCGIConfig') {
                extConfig = "" + item.getValue();
                break;
            }
        }
        var path = CQ.WCM.getPagePath();
        widget.setOptions(eval(mrm.$.ajax({async:false, url:'/bin/cgi-views-options.json?cgiConfigName='+extConfig+'&resPath='+path, type:'GET', cache :false}).responseText));
    }

}

//function to get the advanced youtube settings
(function() {
    var gmdsYoutubeSettings = new GmdsYoutubeSettings();

    window.gmdsYoutubeSettings = function() {
        return gmdsYoutubeSettings;
    };
})();

function GmdsYoutubeSettings() {
    this.hasYoutubeID = function(widget) {

        // Finds out whether there is a youtube Dialog ID set in a specific template

        //do the synchron AJAX request and set the options on success
        var AJAX = getXMLHttpObject();
        if (AJAX) {
            var url = '/bin/youtube_advanced_settings.json?type=retrieve';
            AJAX.open("GET", url, false);
            AJAX.send(null);
            var response = AJAX.responseText;
            if(AJAX.readyState == 4 && AJAX.status == 200){ //success
                widget.add(eval(response));
                widget.doLayout();

            }

        } else {
            alert("error");
        }


    }

    this.refreshProperties = function() {

        // Finds out whether there is a youtube Dialog ID set in a specific template

        //do the synchron AJAX request and set the options on success
        var AJAX = getXMLHttpObject();
        if (AJAX) {
            var url = '/bin/youtube_advanced_settings.json?type=refresh';
            AJAX.open("GET", url, false);
            AJAX.send(null);
            var response = AJAX.responseText;
            if(AJAX.readyState == 4 && AJAX.status == 200){ //success

                window.location.reload();

            }

        } else {
            alert("error");
        }


    }
}

//function to provide additional functionality for selections
(function() {
    var gmdsT07BGetSelection = new GmdsT07BGetSelection();
    window.gmdsT07BGetSelection = function() {
        return gmdsT07BGetSelection;
    };
})();

function GmdsT07BGetSelection(){
    /**
     * Gets the actual value of the Component Selection and sets it
     */
    this.getActualCompValue = function(widget) {
        var AJAX = getXMLHttpObject();
        if (AJAX) {
            var url = '/bin/t07b_getcomponentliquid_values.json?option=COMP'+'&path=' + CQ.WCM.getPagePath();
            AJAX.open("GET", url, false);
            AJAX.send(null);
            var response = AJAX.responseText;
            if(AJAX.readyState == 4 && AJAX.status == 200){ //success
                widget.setValue(response);
            }
        }  
    };
    
    /**
     * Gets the actual value of the liquid gallery and sets it
     */
    this.getActualLiqValue = function(widget) {
        var AJAX = getXMLHttpObject();
        if (AJAX) {
            var url = '/bin/t07b_getcomponentliquid_values.json?option=LIQ'+'&path=' + CQ.WCM.getPagePath();
            AJAX.open("GET", url, false);
            AJAX.send(null);
            var response = AJAX.responseText;
            if(AJAX.readyState == 4 && AJAX.status == 200){ //success
                widget.setValue(response);
            }
        }  
    };
};    
CQ.form.CustomCtaBtn = CQ.Ext.extend(CQ.form.CompositeField, {

    hiddenField: null,
    link: null,
    btnText: null,

    constructor: function(config) {
        config = config || { };
        var defaults = {
            "border": true,
            "layout": "form",
            "columns":2
        };
        config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.CustomCtaBtn.superclass.constructor.call(this, config);
    },

    initComponent: function() {
        CQ.form.CustomCtaBtn.superclass.initComponent.call(this);

        this.hiddenField = new CQ.Ext.form.Hidden({
            name: this.name
        });
        this.add(this.hiddenField);

        this.btnText = new CQ.Ext.form.TextField({
            fieldLabel:"Button Text",
            cls:"btn-text",
            hideLabel: false,
            width: "250",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            },
            optionsProvider: this.optionsProvider
        });
        this.add(this.btnText);

        this.link = new CQ.form.PathField({
            fieldLabel:"Button Link",
            cls:"btn-link",
            hideLabel: false,
            width: "250",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                dialogclose: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        this.add(this.link);

    },

    setValue: function(value) {
        var data = JSON.parse(value);
        this.btnText.setValue(data.btnText);
        this.link.setValue(data.link);
        this.hiddenField.setValue(JSON.stringify(data));
    },

    getValue: function() {
        return this.getRawValue();
    },

    getRawValue: function() {
        var jObj = new Object();
        jObj["btnText"] = this.btnText.getValue();
        jObj["link"] = this.link.getValue();
        return JSON.stringify(jObj);
    },

// private
    updateHidden: function() {
        this.hiddenField.setValue(this.getValue());
    }
});

// register xtype
CQ.Ext.reg('customCtaBtn', CQ.form.CustomCtaBtn);
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
 * @author syee@crownpartners.com
 * @class CQ.form.HotspotSmartImage
 * @extends CQ.form.SmartFile
 * This is an extension to the SmartImage from Day CQ. If the crop tool and rotate tool
 * is used, it will use Day CQ SmartImage's code to rotate and crop images. The
 * HotspotSmartImage simply extended the ImageMap functionality by adding the GMDS 
 * standard link dialog widget instead of the pathfield.
 * 
 * <p>Acknowledgements:<br>
 * Flash is a registered trademark of Adobe Systems, Inc. (http://www.adobe.com).<br>
 * SWFUpload is an open source library (http://www.swfupload.org).</p>
 * @constructor
 * Creates a new SmartImage.
 * @param {Object} config The config object
 */
CQ.form.HotspotSmartImage = CQ.Ext.extend(CQ.form.SmartFile, {

    /**
     * @cfg {String} mimeTypes
     * MIME types allowed for uploading (each separated by a semicolon; wildcard * is
     * allowed; for example: "*.*" or "*.jpg;*.gif;*.png". Defaults to
     * "*.jpg;*.jpeg;*.gif;*.png".
     */
    /**
     * @cfg {String} mimeTypesDescription
     * A String that describes the allowed MIME types (defaults to "Images")
     */
    /**
     * @cfg {String} ddAccept
     * MIME type definition of files that are allowed for referencing using drag &amp; drop
     * (defaults to "image/")
     */
    /**
     * @cfg {String} uploadPanelCls
     * CSS class to be used for the upload panel (defaults to null)
     */
    /**
     * @cfg {Boolean} removeUploadPanelClsOnProgress
     * True if the CSS class of the upload panel should be removed when the upload progress
     * is displayed (defaults to false)
     */
    /**
     * @cfg {Boolean} allowFileNameEditing
     * True if the name of uploaded files is editable (defaults to false). Note that you
     * should not change this value for ExtendedSmartImage.
     */
    /**
     * @cfg {Boolean} transferFileName
     * True if the filename has to be submitted as a separate form field (defaults to
     * false). Note that you should not change this value for ExtendedSmartImage.
     */
    /**
     * @cfg {String} uploadIconCls
     * CSS class to use for displaying the upload icon (defaults to "cq-image-placeholder")
     */
    /**
     * @cfg {String} uploadTextReference
     * Text used in the upload panel if referencing is allowed only (defauls to "Drop an
     * image")
     */
    /**
     * @cfg {String} uploadTextFallback
     * Text used in the upload panel if Flash is unavailable (defaults to "Upload image")
     */
    /**
     * @cfg {String} uploadText
     * Text used in the upload panel if both referencing and uploading are allowed (defaults
     * to "Drop an image or click to upload")
     */
    /**
     * @cfg {Number} height
     * Height of the ExtendedSmartImage component (defaults to "auto"). Note that you will have to
     * specify a concrete value here if you intend to use the ExtendedSmartImage component in
     * conjunction with a {@link CQ.Ext.layout.FormLayout}.
     */

    /**
     * The original image
     * @private
     * @type CQ.form.SmartImage.Image
     */
    originalImage: null,

    /**
     * The processed image
     * @private
     * @type CQ.form.SmartImage.Image
     */
    processedImage: null,

    /**
     * The original image if a file reference is being used (will overlay originalImage if
     * present)
     * @private
     * @type CQ.form.SmartImage.Image
     */
    originalRefImage: null,

    /**
     * The processed image if a file reference is being used (will overlay processedImage
     * if defined
     * @private
     * @type CQ.form.SmartImage.Image
     */
    processedRefImage: null,

    /**
     * @cfg {String} requestSuffix
     * Request suffix - this suffix is used to get the processed version of an image. It is
     * simply appended to the data path of the original image
     */
    requestSuffix: null,

    /**
     * Array with preconfigured tools
     * @private
     * @type Array
     */
    imageToolDefs: null,

    /**
     * @cfg {String} mapParameter
     * Name of the form field used for posting the image map data; use null or a zero-length
     * String if the image mapping tool should be disabled; the value depends on the
     * serverside implementation; use "./imageMap" for CQ foundation's image component;
     * "./image/imageMap" for the textimage component
     */
    mapParameter: null,

    /**
     * @cfg {String} cropParameter
     * Name of the form field used for posting the cropping rect; use null or a zero-length
     * String if the cropping tool should be disabled; the value depends on the serverside
     * implementation; use "./imageCrop" for CQ foundation's image component;
     * "./image/imageCrop" for the textimage component
     */
    cropParameter: null,

    /**
     * @cfg {String} rotateParameter
     * Name of the form field used for posting the rotation angle; use null or a zero-length
     * String if the rotate tool should be disabled; the value depends on the serverside
     * implementation; use "./imageRotate" for CQ foundation's image component;
     * "./image/imageRotate" for the textimage component
     */
    rotateParameter: null,

    /**
     * @cfg {Boolean} disableFlush
     * True to not render the flush button.
     */
    disableFlush: null,

    /**
     * @cfg {Boolean} disableZoom
     * True to not render the zoom slider.
     */
    disableZoom: null,

    /**
     * Toolspecific components
     * @private
     * @type Object
     */
    toolComponents: null,

    /**
     * @cfg {Function} pathProvider
     * <p>The function providing the path to the processed image. This method is used to
     * access the fully processed image and will be called within the scope of the
     * CQ.form.HotspotSmartImage instance.</p>
     * <p>Arguments:</p>
     * <ul>
     *   <li><code>path</code> : String<br>
     *     The content path</li>
     *   <li><code>requestSuffix</code> : String<br>
     *     The configured request suffix (replaces extension)</li>
     *   <li><code>extension</code> : String<br>
     *     The original extension</li>
     *   <li><code>record</code> : CQ.data.SlingRecord<br>
     *     The record representing the instance</li>
     * </ul>
     * <p>Scope:</p>
     * <ul>
     *   <li><code>this</code> : CQ.form.HotspotSmartImage</li>
     * </ul>
     * <p>Returns:</p>
     * <ul>
     *   <li><code>String</code> : The URL or null if the original URL should be used</li>
     * </ul>
     * @see CQ.form.HotspotSmartImage#defaultPathProvider
     */
    pathProvider: null,

    /**
     * @cfg {Boolean} hideMainToolbar
     * true to hide the main toolbar (the one under the actual picture;
     * defaults to false)
     */
    hideMainToolbar: false,

    /**
     * Number of currently pending images
     * @private
     * @type Number
     */
    imagesPending: 0,

    /**
     * @cfg {Boolean} disableInfo
     * True to hide the "information" tool; defaults to false
     * @since 5.4
     */
    disableInfo: false,

    /**
     * The currently displayed info tool tip
     * @private
     * @type CQ.Ext.Tip
     */
    infoTip: null,


    constructor: function(config) {
        config = config || {};
        var defaults = {
            "fullTab":true,
            "mimeTypes": "*.jpg;*.jpeg;*.gif;*.png",
            "mimeTypesDescription": CQ.I18n.getMessage("Images"),
            "ddAccept": "image/",
            "uploadPanelCls": null,
            "removeUploadPanelClsOnProgress": false,
            "allowFileNameEditing": false,
            "transferFileName": false,
            "uploadIconCls": "cq-image-placeholder",
            "uploadTextReference": CQ.I18n.getMessage("Drop an image"),
            "uploadTextFallback": CQ.I18n.getMessage("Upload image"),
            "uploadText": CQ.I18n.getMessage("Drop an image or click to upload"),
            "height": "auto",
            "anchor": null,
            "pathProvider": CQ.form.HotspotSmartImage.defaultPathProvider,
            "hideMainToolbar": false
        };

        // Create tool defs
        this.imageToolDefs = [ ];
        if (config.mapParameter) {
            this.imageToolDefs.push(new CQ.form.HotspotImageMap(config.mapParameter));
            delete config.mapParameter;
        }
        if (config.cropParameter) {
            this.imageToolDefs.push(new CQ.form.ImageCrop(config.cropParameter));
            delete config.cropParameter;
        }
        if (config.rotateParameter) {
            this.imageToolDefs.push(
                    new CQ.form.SmartImage.Tool.Rotate(config.rotateParameter));
            delete config.rotateParameter;
        }

        CQ.Util.applyDefaults(config, defaults);
        CQ.form.HotspotSmartImage.superclass.constructor.call(this, config);

        this.addEvents(

            /**
             * @event beforeloadimage
             * Fires before image data gets loaded. Note that if different versions of
             * the same image (original, processed) are loaded, this only gets fired
             * once.
             * @param {CQ.form.HotspotSmartImage} imageComponent The image component
             * @since 5.4
             */
            "beforeloadimage",

            /**
             * @event loadimage
             * Fires after image data has been loaded successfully. Note that if different
             * versions of the same image (original, processed) are loaded, this only gets
             * fired once, after all versions have been loaded successfully.
             * @param {CQ.form.HotspotSmartImage} imageComponent The image component
             * @since 5.4
             */
            "loadimage",

            /**
             * @event imagestate
             * Fires if the edited image changes state. Currently supported states are:
             * <ul>
             *   <li>processedremoved - if the processed variant of an image becomes
             *     unavailable/invalidates.</li>
             *   <li>processedavailable - if the processed variant of an image becomes
             *     available (and is actually loaded).</li>
             *   <li>originalremoved - if the original variant of an image becomes
             *     unavailable.</li>
             *   <li>originalavailable - if the original variant of an image becomes
             *     available (and is aczually loaded).</li>
             * </ul>
             * @param {CQ.form.HotspotSmartImage} imageComponent The image component
             * @param {String} state The state that has changed (as described above)
             * @param {Object} addInfo (optional) Additional information
             * @since 5.4
             */
            "imagestate"

        );

        // initialize tools
        var toolCnt = this.imageToolDefs.length;
        for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
            this.imageToolDefs[toolIndex].initialize(config);
        }
    },

    // overriding CQ.form.SmartFile#initComponent
    initComponent: function() {

        CQ.form.HotspotSmartImage.superclass.initComponent.call(this);

        this.workingAreaContainer = new CQ.Ext.Panel({
            "itemId": "workingArea",
            "border": false,
            "layout": "border"
        });
        this.processingPanel.add(this.workingAreaContainer);

        // Image display/processing area
        this.workingArea = new CQ.Ext.Panel({
            // "itemId": "workingArea",
            "border": false,
            "layout": "card",
            "region": "center",
            "activeItem": 0,
            "listeners": {
                "beforeadd": function(container, component) {
                    if (container._width && container._height && component.notifyResize) {
                        component.notifyResize.call(component, this._width, this._height);
                    }
                },
                "bodyresize": function(panel, width, height) {
                    if (typeof width == "object") {
                        height = width.height;
                        width = width.width;
                    }
                    if (width && height) {
                        panel._width = width;
                        panel._height = height;
                        var itemCnt = panel.items.getCount();
                        for (var itemIndex = 0; itemIndex < itemCnt; itemIndex++) {
                            var itemToProcess = panel.items.get(itemIndex);
                            if (itemToProcess.notifyResize) {
                                itemToProcess.notifyResize.call(
                                        itemToProcess, width, height);
                            }
                        }
                    }
                }
            },
            "afterRender": function() {
                CQ.Ext.Panel.prototype.afterRender.call(this);
                this.el.setVisibilityMode(CQ.Ext.Element.DISPLAY);
            }
        });
        this.workingAreaContainer.add(this.workingArea);

        // Panel for simple image display
        this.imagePanel = new CQ.form.SmartImage.ImagePanel({
            "itemId": "imageview",
            "listeners": {
                "smartimage.zoomchange": {
                    fn: function(zoom) {
                        if (this.zoomSlider) {
                            this.suspendEvents();
                            this.zoomSlider.setValue(zoom * 10);
                            this.resumeEvents();
                        }
                    },
                    scope: this
                },
                "smartimage.defaultview": {
                    fn: this.disableTools,
                    scope: this
                }
            }
        });
        this.workingArea.add(this.imagePanel);

        // insert customized panels
        if (this.topPanel) {
            this.topPanel.region = "north";
            this.workingAreaContainer.add(this.topPanel);
        }

        // Tool's initComponent
        var toolCnt = this.imageToolDefs.length;
        for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
            this.imageToolDefs[toolIndex].initComponent(this);
        }

        this.on("loadimage", this.adjustUI, this);
    },

    // overriding CQ.form.SmartFile#onRender
    onRender: function(ct, pos) {
        CQ.form.HotspotSmartImage.superclass.onRender.call(this, ct, pos);
        var dialog = this.getToplevel();
        if (dialog) {
            dialog.on("hide", function() {
                this.hideTools();
                this.imagePanel.ignoreRotation = false;
                this.toolSelector.disable();
                this.imagePanel.disablePanelTemporaryily();
            }, this);
            dialog.on("editlocked", function(dlg, isInitialState) {
                // only save drop targets the first time
                if (this.savedDropTargets == null) {
                    this.savedDropTargets = this.dropTargets;
                }
                this.dropTargets = null;
            }, this);
            dialog.on("editunlocked", function(dlg, isInitialState) {
                // only restore if there are saved drop targets available (they will not if
                // the initial state of the component is unlocked)
                if (this.savedDropTargets != null) {
                    this.dropTargets = this.savedDropTargets;
                }
            }, this);
        }
    },

    // Field Lock --------------------------------------------------------------------------

    handleFieldLock: function(iconCls, fieldEditLock, fieldEditLockDisabled, rec) {
        var field = this;

        // check edit lock based on image data
        if (rec.get("image")) {
            var imgData = rec.get("image");
            var mixins = imgData["jcr:mixinTypes"];

            // check if entire node is canceled
            if (mixins
                && (mixins.indexOf(CQ.wcm.msm.MSM.MIXIN_LIVE_SYNC_CANCELLED) != -1)) {

                fieldEditLock = false;
                fieldEditLockDisabled = true;
                iconCls = "cq-dialog-unlocked";
            }

            // check if property inheritance is canceled
            if (imgData[CQ.wcm.msm.MSM.PARAM_PROPERTY_INHERITANCE_CANCELED]) {
                fieldEditLock = false; // currently we cancel inheritance for all props that are managed by HotspotSmartImage
                iconCls = "cq-dialog-unlocked";
            }
        }
        field.editLock = fieldEditLock;
        field.editLockDisabled = fieldEditLockDisabled;

        // disable toolbar items
        this.setToolbarEnabled(!(fieldEditLock && !fieldEditLockDisabled));

        if (fieldEditLock && !fieldEditLockDisabled) {
            this.dropTargets[0].lock();
            this.processingPanel.body.mask();
        }
        var tip = "";
        if (fieldEditLockDisabled) {
            tip = CQ.Dialog.INHERITANCE_BROKEN;
        } else {
            tip = fieldEditLock ? CQ.Dialog.CANCEL_INHERITANCE : CQ.Dialog.REVERT_INHERITANCE;
        }

        if (!this.fieldEditLockBtn) {
            var dlg = this.findParentByType("dialog");
            field.fieldEditLockBtn = new CQ.TextButton({
                "disabled":fieldEditLockDisabled,
                "tooltip":tip,
                "cls":"cq-dialog-editlock cq-smartimage-editlock",
                "iconCls":iconCls,
                "handler":function() {
                    dlg.switchPropertyInheritance(this, null, function(iconCls, editLock) {
                        this.fieldEditLockBtn.setIconClass(iconCls);
                        this.fieldEditLockBtn.setTooltip(iconCls == "cq-dialog-unlocked" ?
                                CQ.Dialog.REVERT_INHERITANCE : CQ.Dialog.CANCEL_INHERITANCE);
                        this.editLock = editLock;

                        if (editLock) {
                            this.dropTargets[0].lock();
                            this.processingPanel.body.mask();
                        } else {
                            this.dropTargets[0].unlock();
                            this.processingPanel.body.unmask();
                        }
                        this.setToolbarEnabled(!editLock)
                    });

                },
                "scope":this
            });
            this.toolSelector.add(this.fieldEditLockBtn);
        } else {
            this.fieldEditLockBtn.setDisabled(fieldEditLockDisabled);
            this.fieldEditLockBtn.setIconClass(iconCls);
            this.fieldEditLockBtn.setTooltip(iconCls == "cq-dialog-unlocked" ?
                    CQ.Dialog.REVERT_INHERITANCE : CQ.Dialog.CANCEL_INHERITANCE);
        }
    },

    /**
     * Returns the names of all fields that are managed by SmartImage.
     */
    getFieldLockParameters: function(params) {
        if (!params[ CQ.wcm.msm.MSM.PARAM_PROPERTY_NAME ]) {
            params[ CQ.wcm.msm.MSM.PARAM_PROPERTY_NAME ] = [];
        }
        params[ CQ.wcm.msm.MSM.PARAM_PROPERTY_NAME ].push(this.getPropertyName(this.fileNameParameter));
        params[ CQ.wcm.msm.MSM.PARAM_PROPERTY_NAME ].push(this.getPropertyName(this.fileReferenceParameter));

        for (var i=0; i<this.imageToolDefs.length; i++) {
            params[ CQ.wcm.msm.MSM.PARAM_PROPERTY_NAME ].push(
                this.getPropertyName(this.imageToolDefs[i].transferFieldName));
        }
        return params;
    },

    getFieldLockTarget: function(path) {
        return path += "/image"; // TODO this should come from config!!
    },

    /**
     * @private
     */
    getPropertyName: function(param) {
        return param.substr(param.lastIndexOf("/") + 1);
    },


    // Validation --------------------------------------------------------------------------

    // overriding CQ.form.SmartFile#markInvalid
    markInvalid: function(msg) {
        if (!this.rendered || this.preventMark) { // not rendered
            return;
        }
        msg = msg || this.invalidText;
        this.uploadPanel.body.addClass(this.invalidClass);
        this.imagePanel.addCanvasClass(this.invalidClass);
        this.uploadPanel.body.dom.qtip = msg;
        this.uploadPanel.body.dom.qclass = 'x-form-invalid-tip';
        if (CQ.Ext.QuickTips) { // fix for floating editors interacting with DND
            CQ.Ext.QuickTips.enable();
        }
        this.fireEvent('invalid', this, msg);
    },

    // overriding CQ.form.SmartFile#clearInvalid
    clearInvalid: function() {
        if(!this.rendered || this.preventMark) { // not rendered
            return;
        }
        this.uploadPanel.body.removeClass(this.invalidClass);
        this.imagePanel.removeCanvasClass(this.invalidClass);
        this.fireEvent('valid', this);
    },


    // Model -------------------------------------------------------------------------------

    /**
     * Postprocesses the file information as delivered by the repository and creates
     * all necessary image objects.
     * @param {CQ.data.SlingRecord} record The record to be processed
     * @param {String} path Base path for resolving relative file paths
     * @private
     */
    postProcessRecord: function(record, path) {
        this.dataRecord = record;
        if (this.originalImage != null) {
            this.fireEvent("statechange", "originalremoved", true);
        }
        this.originalImage = null;
        if (this.processedImage != null) {
            this.fireEvent("statechange", "processedremoved", true);
        }
        this.processedImage = null;
        if (this.originalRefImage != null) {
            this.fireEvent("statechange", "originalremoved", false);
        }
        this.originalRefImage = null;
        if (this.processedRefImage != null) {
            this.fireEvent("statechange", "processedremoved", false);
        }
        this.processedRefImage = null;
        var processedImageConfig = null;
        this.fireEvent("beforeloadimage", this);
        if (this.referencedFileInfo) {
            this.originalRefImage = new CQ.form.SmartImage.Image({
                "dataPath": this.referencedFileInfo.dataPath,
                "url": this.referencedFileInfo.url,
                "fallbackUrl": this.referencedFileInfo.fallbackUrl
            });
            this.notifyImageLoad(this.originalRefImage);
            processedImageConfig =
                    this.createProcessedImageConfig(this.referencedFileInfo.dataPath);
            if (processedImageConfig) {
                this.processedRefImage =
                        new CQ.form.SmartImage.Image(processedImageConfig);
                this.notifyImageLoad(this.processedRefImage);
            }
            this.originalRefImage.load();
            if (processedImageConfig) {
                this.processedRefImage.load();
            }
        }
        if (this.fileInfo) {
            this.originalImage = new CQ.form.SmartImage.Image({
                "dataPath": this.fileInfo.dataPath,
                "url": this.fileInfo.url
            });
            this.notifyImageLoad(this.originalImage);
            processedImageConfig = this.createProcessedImageConfig(path);
            if (processedImageConfig) {
                this.processedImage = new CQ.form.SmartImage.Image(
                        this.createProcessedImageConfig(path));
                this.notifyImageLoad(this.processedImage);
            }
            this.originalImage.load();
            if (processedImageConfig) {
                this.processedImage.load();
            }
        }
        // tools
        var toolCnt = this.imageToolDefs.length;
        for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
            var tool = this.imageToolDefs[toolIndex];
            tool.processRecord(record);
        }
    },

    /**
     * Method that is called to inform the SmartImage component about a new image that is
     * about to be loaded.
     * @param {CQ.form.SmartImage.Image} img The image that is about to be loaded
     * @private
     */
    notifyImageLoad: function(img) {
        if (!this.toolSelector.disabled && !this.hideMainToolbar) {
            this.toolSelector.disable();
        }
        this.imagesPending++;
        img.addToolLoadHandler(function() {
            this.imagesPending--;
            if (this.imagesPending == 0) {
                this.fireEvent("loadimage", this);
            }
            if (img == this.processedImage) {
                this.fireEvent("imagestate", this, "processedavailable", true);
            } else if (img == this.processedRefImage) {
                this.fireEvent("imagestate", this, "processedavailable", false);
            } else if (img == this.originalImage) {
                this.fireEvent("imagestate", this, "originalavailable", true);
            } else if (img == this.originalRefImage) {
                this.fireEvent("imagestate", this, "originalavailable", false);
            }
        }.createDelegate(this), true);
    },

    /**
     * Creates a configuration object that describes processed image data.
     * @param {String} path The path of the original image
     * @return {Object} The configuration object for the processed image; format is:
     *         <ul>
     *           <li>dataPath (String) - data path (without webapp context path; for
     *             example: "/content/app/images/image.png")</li>
     *           <li>url (String) - URL (including webapp context path; for example:
     *             "/cq5/content/app/images/image.png")</li>
     *         </ul>
     * @private
     */
    createProcessedImageConfig: function(path) {
        var extension = "";
        if (path) {
            var extSepPos = path.lastIndexOf(".");
            var slashPos = path.lastIndexOf("/");
            if ((extSepPos > 0) && (extSepPos > (slashPos + 1))) {
                extension = path.substring(extSepPos, path.length);
            }
        }
        var url = this.pathProvider.call(
                this, this.dataPath, this.requestSuffix, extension, this.dataRecord, this);
        if (url == null) {
            return null;
        }
        return {
            "url": url
        };
    },

    /**
     * <p>Synchronizes form elements with the current UI state.</p>
     * <p>All form fields are adjusted accordingly. Registered tools are synchronized, too.
     * </p>
     * @private
     */
    syncFormElements: function() {
        CQ.form.HotspotSmartImage.superclass.syncFormElements.call(this);
        // sync tools
        var toolCnt = this.imageToolDefs.length;
        for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
            var toolToProcess = this.imageToolDefs[toolIndex];
            toolToProcess.transferToField();
        }
    },

    /**
     * Determines if a procecessed image is currently used.
     * @return True if a processed image is used
     */
    usesProcessedImage: function() {
        var usedImg = this.getSuitableImage(false);
        return (usedImg == this.processedImage) || (usedImg == this.processedRefImage);
    },

    /**
     * <p>Invalidates the processed images.</p>
     * <p>This should be used by tools that change an image in a way that requires them
     * to be saved to the server before further editing is available.
     */
    invalidateProcessedImages: function() {
        if (this.processedImage != null) {
            this.processedImage = null;
            this.fireEvent("imagestate", this, "processedremoved", true);
        }
        if (this.processedRefImage != null) {
            this.processedRefImage = null;
            this.fireEvent("imagestate", this, "processedremoved", false);
        }
    },


    // View --------------------------------------------------------------------------------

    /**
     * Creates the panel (used in a CardLayout) that is responsible for editing the managed
     * image.
     * @return {CQ.Ext.Panel} The panel created
     * @private
     */
    createProcessingPanel: function() {

        if (!this.hideMainToolbar) {
            var toolCnt, toolIndex;
            this.imageTools = [ ];
            var imageToolsConfig = [ ];
            toolCnt = this.imageToolDefs.length;
            for (toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
                var toolToProcess = this.imageToolDefs[toolIndex];
                var buttonToAdd;
                if (!toolToProcess.isCommandTool) {
                    buttonToAdd = new CQ.Ext.Toolbar.Button( {
                        "text": toolToProcess["toolName"],
                        "itemId": toolToProcess["toolId"],
                        "toolRef": toolToProcess,
                        "iconCls": toolToProcess["iconCls"],
                        "actionHandler": this.toolClicked.createDelegate(this),
                        "enableToggle": true,
                        "toggleGroup": "imageTools",
                        "allowDepress": true,
                        "listeners": {
                            "click": function() {
                                this.actionHandler(this.toolRef);
                            }
                        }
                    } );
                } else {
                    buttonToAdd = new CQ.Ext.Toolbar.Button( {
                        "text": toolToProcess["toolName"],
                        "itemId": toolToProcess["toolId"],
                        "toolRef": toolToProcess,
                        "iconCls": toolToProcess["iconCls"],
                        "actionHandler": this.commandToolClicked.createDelegate(this),
                        "enableToggle": false,
                        "listeners": {
                            "click": function() {
                                this.actionHandler(this.toolRef);
                            }
                        }
                    } );
                }
                toolToProcess.buttonComponent = buttonToAdd;
                this.imageTools.push(buttonToAdd);
                toolToProcess.createTransferField(this);
                imageToolsConfig.push(buttonToAdd);
            }
            if (!this.disableFlush) {
                imageToolsConfig.push( {
                    "xtype": "tbseparator"
                } );
                imageToolsConfig.push( {
                    "xtype": "tbbutton",
                    "text": CQ.I18n.getMessage("Clear"),
                    "iconCls": "cq-image-icon-clear",
                    "listeners": {
                        "click": {
                            "fn": this.flushImage,
                            "scope": this
                        }
                    }
                } );
            }
            if (!this.disableInfo) {
                imageToolsConfig.push( {
                    "xtype": "tbseparator"
                } );
                imageToolsConfig.push( {
                    "itemId": "infoTool",
                    "xtype": "tbbutton",
                    "iconCls": "cq-image-icon-info",
                    "listeners": {
                        "click": {
                            "fn": this.showImageInfo,
                            "scope": this
                        }
                    }
                } );
            }
            imageToolsConfig.push( {
                "xtype": "tbfill"
            } );
            if (!this.disableZoom) {
                this.zoomSlider = new CQ.Ext.Slider( {
                    "width": 200,
                    "minValue": 0,
                    "maxValue": 90,
                    "vertical": false,
                    "listeners": {
                        "change": {
                            fn: function(slider, newValue) {
                                this.imagePanel.setZoom(newValue / 10);
                            },
                            scope: this
                        }
                    }
                } );
                imageToolsConfig.push(this.zoomSlider);
            }
        }

        // create panel with "bottom toolbar"
        this.toolSelector = new CQ.Ext.Toolbar(imageToolsConfig);
        this.toolSelector.disable();
        return new CQ.Ext.Panel({
            "itemId": "processing",
            "layout": "fit",
            "border": false,
            // button bar must be created this way, otherwise Firefox gets confused
            "bbar": (!this.hideMainToolbar ? this.toolSelector : null),
            "afterRender": function() {
                CQ.Ext.Panel.prototype.afterRender.call(this);
                this.el.setVisibilityMode(CQ.Ext.Element.DISPLAY);
                this.body.setVisibilityMode(CQ.Ext.Element.DISPLAY);
            }
        });
    },

    /**
     * <p>Updates the UI to the current state of the component.</p>
     * <p>The correct basic panel (upload/referencing vs. editing) is chosen. All editing
     * stuff is reset to a default state. The editing area is notified about the image to
     * display, if applicable.</p>
     * @private
     */
    updateView: function() {
        var hasAnyImage = this.originalImage || this.originalRefImage
                || this.processedImage || this.processedRefImage;
        this.updateViewBasics(hasAnyImage);
        if (hasAnyImage) {
            this.workingArea.getLayout().setActiveItem("imageview");
            this.resetTools();
            this.resetZoomSlider();
        }
        this.updateImageInfoState();
        this.doLayout();
        if (this.processedRefImage) {
            this.imagePanel.updateImage(this.processedRefImage);
        } else if (this.originalRefImage) {
            this.imagePanel.updateImage(this.originalRefImage);
        } else if (this.processedImage) {
            this.imagePanel.updateImage(this.processedImage);
        } else if (this.originalImage) {
            this.imagePanel.updateImage(this.originalImage);
        }
    },

    /**
     * Resets the "tools" toolbar.
     * @private
     */
    resetTools: function() {
        if (!this.hideMainToolbar) {
            var toolCnt = this.imageTools.length;
            for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
                var tool = this.imageTools[toolIndex];
                if (tool.enableToggle) {
                    tool.toggle(false);
                }
            }
        }
        this.imagePanel.hideAllShapeSets(false);
    },

    /**
     * Resets the zoom slider.
     * @private
     */
    resetZoomSlider: function() {
        if (this.zoomSlider) {
            this.zoomSlider.suspendEvents();
            this.zoomSlider.setValue(0);
            this.zoomSlider.resumeEvents();
        }
    },

    /**
     * Gets the panel used for displaying &amp; editing an image.
     * @return {CQ.form.SmartImage.ImagePanel} The image panel used for displaying/editing
     *         an image
     * @private
     */
    getImagePanel: function() {
        return this.imagePanel;
    },

    /**
     * Handler that adjusts the UI after loading an image (all variants) has been completed.
     */
    adjustUI: function() {
        if (!this.hideMainToolbar) {
            // Toolbar#enable will enable all buttons - so we'll have to save the
            // info tool's disabled state and restore it accordingly
            var infoTool;
            if (!this.disableInfo) {
                infoTool = this.toolSelector.items.get("infoTool");
                var isInfoToolDisabled = infoTool.disabled;
            }
            if (!this.editLock || this.editLockDisabled) {
                // first, enable toolbar as a whole, then enable each tool (allowing it
                // to veto)
                this.toolSelector.enable();
                this.enableToolbar();
                if (!this.disableInfo) {
                    infoTool.setDisabled(isInfoToolDisabled);
                }
            }
            if (this.fieldEditLockBtn) {
                this.fieldEditLockBtn.setDisabled(this.editLockDisabled);
            }
        }
    },

    /**
     * Sets the toolbar's enabled state.
     * @param {Boolean} isEnabled True to enable the toolbar
     */
    setToolbarEnabled: function(isEnabled) {
        (isEnabled ? this.enableToolbar() : this.disableToolbar());
    },

    /**
     * <p>Disables the toolbar as a whole.</p>
     * <p>The "lock button" is excluded from being disabled, as it is a special case.</p>
     */
    disableToolbar: function() {
        this.toolSelector.items.each(function(item) {
                if (item != this.fieldEditLockBtn) {
                    item.setDisabled(true);
                }
            }, this);
    },

    /**
     * <p>Enables the toolbar as a whole. Allows each tool to decide for itself if it
     * should actually be enabled. It also considers locking state.</p>
     * <p>The "lock button" is excluded from being enabled, as it is a special case.</p>
     */
    enableToolbar: function() {
        this.toolSelector.items.each(function(item) {
                if (item != this.fieldEditLockBtn) {
                    var isEnabled = (!this.editLock || this.editLockDisabled);
                    // ask tool if it has actually to be enabled or if it should be kept
                    // disabled due to some internal reason
                    if (isEnabled && item.toolRef) {
                        isEnabled = item.toolRef.isEnabled();
                    }
                    item.setDisabled(!isEnabled);
                }
            }, this);
    },


    // Internal event handling -------------------------------------------------------------

    /**
     * Handles a primarily successful upload by loading the uploaded image and updating
     * everything after the image has been loaded.
     * @return {Boolean} True, if the upload is still valid/successful after executing
     *         the handler
     * @private
     */
    onUploaded: function() {
        this.originalImage = new CQ.form.SmartImage.Image(this.fileInfo);
        this.originalImage.loadHandler = function() {
            var toolCnt = this.imageToolDefs.length;
            for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
                this.imageToolDefs[toolIndex].onImageUploaded(this.originalImage);
            }
            this.syncFormElements();
            this.updateView();
        }.createDelegate(this);
        this.fireEvent("beforeloadimage", this);
        this.notifyImageLoad(this.originalImage);
        this.originalImage.load();
        if (this.processedImage != null) {
            this.processedImage = null;
            this.fireEvent("imagestate", this, "processedremoved", true);
        }
        return true;
    },


    // Tools -------------------------------------------------------------------------------

    /**
     * <p>Handler that propagates clicks related to tools to the corresponding tool
     * implementation.</p>
     * <p>This handler is responsble for clicks on "non-command"-tools.</p>
     * @param {CQ.Ext.Toolbar.Button} tool The toolbar button representing the tool that
     *        has been clicked
     * @private
     */
    toolClicked: function(tool) {
        var prevTool;
        var toolButton = tool.buttonComponent;
        if (toolButton.pressed) {
            var isFirstTimeCall = false;
            if (this.toolComponents == null) {
                this.toolComponents = { };
            }
            if (!this.toolComponents[tool.toolId]) {
                this.toolComponents[tool.toolId] = {
                    isVisible: false,
                    toolRef: tool
                };
                isFirstTimeCall = true;
            }
            var toolDef = this.toolComponents[tool.toolId];
            // hide all other tools' components
            prevTool = this.hideTools(tool.toolId);
            // render (if necessary) and show tools' components
            if (tool.userInterface && (!tool.userInterface.rendered)) {
                tool.userInterface.render(CQ.Util.getRoot());
            }
            if (prevTool) {
                prevTool.onDeactivation();
            }
            if (tool.userInterface) {
                tool.userInterface.show();
                toolDef.isVisible = true;
                if (!(tool.userInterface.saveX && tool.userInterface.saveY)) {
                    var height = tool.userInterface.getSize().height;
                    var pos = this.getPosition();
                    var toolbarPosX = pos[0];
                    var toolbarPosY = pos[1] - (height + 4);
                    if (toolbarPosX < 0) {
                        toolbarPosX = 0;
                    }
                    if (toolbarPosY < 0) {
                        toolbarPosY = 0;
                    }
                    tool.userInterface.setPosition(toolbarPosX, toolbarPosY);
                } else {
                    tool.userInterface.setPosition(
                            tool.userInterface.saveX, tool.userInterface.saveY);
                }
            }
            tool.onActivation();
        } else {
            prevTool = this.hideTools();
            if (prevTool) {
                prevTool.onDeactivation();
            }
            this.imagePanel.drawImage();
        }
    },

    /**
     * <p>Handler that propagates clicks related to tools to the corresponding tool
     * implementation.</p>
     * <p>This handler is responsble for clicks on "command"-tools.</p>
     * @param {Object} tool The tool definition (as found as an element of
     *        {@link #imageToolDefs})
     * @private
     */
    commandToolClicked: function(tool) {
        tool.onCommand();
    },

    /**
     * Hides the UI of all currently visible tools.
     * @param {String} toolId (optional) ID of tool that is excluded from being hidden if it
     *        is currently shown
     * @private
     */
    hideTools: function(toolId) {
        if (!this.hideMainToolbar) {
            var prevTool;
            for (var toolToHide in this.toolComponents) {
                var hideDef = this.toolComponents[toolToHide];
                if (toolToHide != toolId) {
                    if (hideDef.isVisible) {
                        hideDef.toolRef.userInterface.hide();
                        hideDef.isVisible = false;
                        prevTool = hideDef.toolRef;
                    }
                }
            }
        }
        return prevTool;
    },

    /**
     * <p>Disables all currently active tool components.</p>
     * <p>In addition to {@link #hideTools}, this method toggles the tool's button
     * accordingly and sends the required "onDeactivation" events.</p>
     * @private
     */
    disableTools: function() {
        if (!this.hideMainToolbar) {
            var prevTool = this.hideTools();
            if (prevTool) {
                prevTool.onDeactivation();
            }
            var toolCnt = this.imageTools.length;
            for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
                var toolButton = this.imageTools[toolIndex];
                if (toolButton.pressed) {
                    toolButton.suspendEvents();
                    toolButton.toggle(false);
                    toolButton.resumeEvents();
                }
            }
        }
    },

    /**
     * Updates the state of the image info button. Currently, it gets disabled if no
     * reference info is available, as only the referenced file is displayed in the
     * image info popup.
     */
    updateImageInfoState: function() {
        if (!this.disableInfo && !this.hideMainToolbar) {
            var infoTool = this.toolSelector.items.get("infoTool");
            var isReferenced = (this.referencedFileInfo != null);
            (isReferenced ? infoTool.enable() : infoTool.disable());
        }
    },

    /**
     * Shows info for the currently edited image.
     */
    showImageInfo: function() {
        if (this.infoTip != null) {
            var wasShown = this.infoTip.hidden == false;
            this.infoTip.hide();
            if (wasShown) {
                // toggle
                return;
            }
        }
        var clickHandler = function() {
            if (this.infoTip != null) {
                this.infoTip.hide();
                this.infoTip = null;
            }
        };
        var infoTool = this.toolSelector.items.get("infoTool");
        this.infoTip = new CQ.Ext.Tip({
            "title": CQ.I18n.getMessage("Image info"),
            "html": '<span class="cq-smartimage-refinfo">' +
                    this.getRefText(this.referencedFileInfo.dataPath) + '</span>',
            "maxWidth": 500,
            "autoHide": false,
            "closable": true,
            "listeners": {
                "hide": function() {
                    CQ.Ext.EventManager.un(document, "click", clickHandler, this);
                },
                "scope": this
            }
        });
        CQ.Ext.EventManager.on.defer(10, this, [ document, "click", clickHandler, this ]);
        this.infoTip.showBy(infoTool.el, "tl-tr");
    },


    // Processing --------------------------------------------------------------------------

    /**
     * <p>Removes the currently edited image and propagates the change to the UI.</p>
     * <p>After the method has executed, the component is ready for uploading or referencing
     * a new image.</p>
     * @param {Boolean} preventUpdate (optional) True if the UI must not be updated
     * @private
     */
    flushImage: function(preventUpdate) {
        this.flush();
        if (this.processedRefImage != null) {
            this.processedRefImage = null;
            this.fireEvent("imagestate", this, "processedremoved", false);
        }
        if (this.processedImage != null) {
            this.processedImage = null;
            this.fireEvent("imagestate", this, "processedremoved", true);
        }
        this.processedImage = null;
        if (this.originalRefImage) {
            this.originalRefImage = null;
            this.fireEvent("imagestate", this, "originalremoved", false);
        } else if (this.originalImage) {
            this.originalImage = null;
            this.fireEvent("imagestate", this, "originalremoved", true);
        }
        if (preventUpdate !== true) {
            this.syncFormElements();
            this.notifyToolsOnFlush();
            this.hideTools();
            this.updateView();
        }
    },

    /**
     * Should reset the field to the original state. Currently just "flushes" the data.
     */
    // overriding CQ.form.SmartFile#reset
    reset: function() {
        // todo implement correctly
        this.flushImage();
        CQ.form.HotspotSmartImage.superclass.reset.call(this);
    },


    /**
     * Notifies all tools when an image gets flushed.
     * @private
     */
    notifyToolsOnFlush: function() {
        var toolCnt = this.imageToolDefs.length;
        for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
            this.imageToolDefs[toolIndex].onImageFlushed();
        }
    },


    // Helpers -----------------------------------------------------------------------------

    /**
     * <p>Gets the image object that is best suited according to the state of the currently
     * edited image.</p>
     * <p>Referenced images "overlay" uploaded images. Processed images have precedence over
     * original images.</p>
     * @param {Boolean} useOriginalImage True if the original version of the image should be
     *        preferred to the processed version
     * @return {CQ.form.SmartImage.Image} The image object
     * @private
     */
    getSuitableImage: function(useOriginalImage) {
        var image;
        if (this.processedRefImage && !useOriginalImage) {
            image = this.processedRefImage;
        } else if (this.originalRefImage) {
            image = this.originalRefImage;
        } else if (this.processedImage && !useOriginalImage) {
            image = this.processedImage;
        } else if (this.originalImage) {
            image = this.originalImage;
        }
        return image;
    },


    // Drag & Drop implementation ----------------------------------------------------------

    /**
     * Handler that reacts on images that are dropped on the component.
     * @param {Object} dragData Description of the object that has been dropped on the
     *        component
     */
    // overriding CQ.form.SmartFile#handleDrop
    handleDrop: function(dragData) {
        if (this.handleDropBasics(dragData)) {
            this.originalRefImage = new CQ.form.SmartImage.Image(this.referencedFileInfo);
            this.originalRefImage.loadHandler = function() {
                this.hideTools();
                var toolCnt = this.imageToolDefs.length;
                for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
                    this.imageToolDefs[toolIndex].onImageUploaded(this.originalRefImage);
                }
                this.syncFormElements();
                this.updateView();
            }.createDelegate(this);
            if (this.processedRefImage != null) {
                this.processedRefImage = null;
                this.fireEvent("imagestate", this, "processedremoved", false);
            }
            this.fireEvent("beforeloadimage", this);
            this.notifyImageLoad(this.originalRefImage);
            this.originalRefImage.load();
            return true;
        }
        return false;
    }

});

 /**
  * The default function providing the path to the processed image. See also
  * {@link CQ.form.HotspotSmartImage#pathProvider pathProvider}. Assembles and returns the path of
  * the image.
  * @static
  * @param {String} path The content path
  * @param {String} requestSuffix The configured request suffix (replaces extension)
  * @param {String} extension The original extension
  * @param {CQ.data.SlingRecord} record The data record
  * @return {String} The URL
  */
CQ.form.HotspotSmartImage.defaultPathProvider = function(path, requestSuffix, extension, record) {
    if (!requestSuffix) {
        return null;
    }
    return CQ.HTTP.externalize(path + requestSuffix);
};

// register xtype
CQ.Ext.reg('hotspotsmartimage', CQ.form.HotspotSmartImage);
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
 * @author syee@crownpartners.com
 * @class CQ.form.HotspotImageMap
 * @extends CQ.form.SmartImage.Tool
 * @private
 * The HotspotImageMap provides the image map tool for {@link CQ.form.HotspotSmartImage}.
 * The HotspotImageMap is extended from the CQ.form.ImageMap from Day CQ. 
 * @constructor
 * Creates a new ImageMap.
 * @param {String} transferFieldName Name of the form field that is used for transferring
 * the image crop information
 */
CQ.form.HotspotImageMap = CQ.Ext.extend(CQ.form.SmartImage.Tool, {

    /**
     * Flag if the tool has already been initialized
     * @private
     * @type Boolean
     */
    isInitialized: false,

    /**
     * Flag if the image is currently being loaded
     * @private
     * @type Boolean
     */
    isLoading: false,


    constructor: function(transferFieldName) {
        CQ.form.HotspotImageMap.superclass.constructor.call(this, {
            "toolId": "smartimageMap",
            "toolName": CQ.I18n.getMessage("Map"),
            "iconCls": "cq-image-icon-map",
            "isCommandTool": false,
            "userInterface": new CQ.form.HotspotImageMap.UI( {
                "title": CQ.I18n.getMessage("Image map tools")
            }),
            "transferFieldName": transferFieldName
        });
    },

    /**
     * Initializes the tool's components by registering the underlying
     * {@link CQ.form.SmartImage.ImagePanel} and all necessary event handlers.
     * @param {CQ.form.HotspotSmartImage} imageComponent The underlying image panel
     */
    initComponent: function(imageComponent) {
        CQ.form.HotspotImageMap.superclass.initComponent.call(this, imageComponent);
        this.workingArea = this.imageComponent.getImagePanel();
        this.workingArea.on("contentchange", this.onContentChange, this);
        this.imageComponent.on("beforeloadimage", function() {
            this.isLoading = true;
            if (this.buttonComponent != null) {
                this.buttonComponent.setTooltip(null);
            }
        }, this);
        this.imageComponent.on("loadimage", function() {
            this.isLoading = false;
            this.adjustButtonToState();
        }, this);
        this.imageComponent.on("imagestate", function() {
            if (!this.isLoading) {
                this.adjustButtonToState();
            }
        }, this);
    },

    /**
     * Handler that is called when the image map tool is activated.
     */
    onActivation: function() {
        CQ.form.HotspotImageMap.superclass.onActivation.call(this);
        if (!this.isInitialized) {
            if (this.mapShapeSet == null) {
                this.mapShapeSet =
                        new CQ.form.SmartImage.ShapeSet(CQ.form.ImageMap.SHAPESET_ID);
                this.workingArea.addShapeSet(this.mapShapeSet);
            }
            this.userInterface.notifyWorkingArea(this.workingArea, this.mapShapeSet);
            this.isInitialized = true;
        }
        this.workingArea.hideAllShapeSets(false);
        if (this.initialValue != null) {
            this.deserialize(this.initialValue);
            this.initialValue = null;
        }
        this.userInterface.isActive = true;
        this.workingArea.setShapeSetVisible(CQ.form.ImageMap.SHAPESET_ID, true, true);
    },

    /**
     * Handler that is called when the image map tool is deactivated.
     */
    onDeactivation: function() {
        this.workingArea.clearSelection();
        this.userInterface.isActive = false;
        this.workingArea.setShapeSetVisible(CQ.form.ImageMap.SHAPESET_ID, false, false);
        CQ.form.HotspotImageMap.superclass.onDeactivation.call(this);
    },

    /**
     * <p>Clears the current image map.</p>
     * <p>Note that the view is not updated.</p>
     * @private
     */
    clearMappingInformation: function() {
        if (this.mapShapeSet) {
            try {
                this.workingArea.clearSelection();
                this.mapShapeSet.removeAllShapes();
            } catch (e) {
                // ignored intentionally
            }
        }
        this.initialValue = null;
    },

    /**
     * Handler that removes mapping information when a new image gets uploaded/referenced.
     */
    onImageUploaded: function() {
        this.clearMappingInformation();
        CQ.form.HotspotImageMap.superclass.onImageUploaded.call(this);
    },

    /**
     * Handler that removes mapping information when the image gets flushed.
     */
    onImageFlushed: function() {
        this.clearMappingInformation();
        CQ.form.HotspotImageMap.superclass.onImageFlushed.call(this);
    },

    /**
     * <p>Handler that reacts on "smartimage.contentchange" events.</p>
     * <p>Note that currently only rotation is supported.</p>
     * @param {Object} contentChangeDef Definition of content change to handle
     */
    onContentChange: function(contentChangeDef) {
        if (contentChangeDef.changeType == "rotate") {
            var imageSize = this.workingArea.originalImageSize;
            if (this.mapShapeSet == null) {
                this.mapShapeSet =
                        new CQ.form.SmartImage.ShapeSet(CQ.form.ImageMap.SHAPESET_ID);
                this.mapShapeSet.isVisible = false;
                this.workingArea.addShapeSet(this.mapShapeSet);
                if (this.initialValue) {
                    this.deserialize(this.initialValue);
                    this.initialValue = null;
                }
            }
            var rotation = parseInt(contentChangeDef.valueDelta);
            var absRotation = parseInt(contentChangeDef.newValue);
            if (rotation != 0) {
                var shapeCnt = this.mapShapeSet.getShapeCount();
                for (var shapeIndex = 0; shapeIndex < shapeCnt; shapeIndex++) {
                    var shapeToAdapt = this.mapShapeSet.getShapeAt(shapeIndex);
                    shapeToAdapt.rotateBy(rotation, absRotation, imageSize);
                }
                this.workingArea.drawImage();
            }
        }
    },

    /**
     * Transfers the mapping data from the user interface to the form field that is used
     * for submitting the data to the server.
     */
    transferToField: function() {
        if (this.userInterface) {
            this.userInterface.saveDestinationArea();
        }
        CQ.form.HotspotImageMap.superclass.transferToField.call(this);
    },

    /**
     * Creates a string that represents all areas of the image map.
     * @return {String} A string that represents all areas of the image map.
     */
    serialize: function() {
        if (!this.isInitialized) {
            return null;
        }
        if (this.mapShapeSet == null) {
            return "";
        }
        var dump = "";
        var areaCnt = this.mapShapeSet.getShapeCount();
        for (var areaIndex = 0; areaIndex < areaCnt; areaIndex++) {
            var areaToAdd = this.mapShapeSet.getShapeAt(areaIndex);
            dump += "[" + areaToAdd.serialize() + "]";
            //Foo: added this here for testing
            if(areaIndex < areaCnt - 1) {
            	dump += "@@";
            }
        }
        return dump;
    },

    /**
     * <p>Creates the areas of the image map according to the specified string
     * representation.</p>
     * <p>The method may be used even before the component is completely initialized.
     * null values and empty strings are processed correctly.</p>
     * <p>To reflect the changes visually, {@link CQ.form.ExtendedSmartImage.ImagePanel#drawImage}
     * must be called explicitly.</p>
     * @param {String} strDefinition String definition to create the image map areas (as
     *        created by {@link #serialize})
     */
    deserialize: function(strDefinition) {
        this.mapShapeSet.removeAllShapes();
        if (strDefinition && (strDefinition.length > 0)) {
            var processingPos = 0;
            while (processingPos < strDefinition.length) {
                var startPos = strDefinition.indexOf("[", processingPos);
                if (startPos < 0) {
                    break;
                }
                var coordEndPos = strDefinition.indexOf(")", startPos + 1);
                if (coordEndPos < 0) {
                    break;
                }
                var areaDef = strDefinition.substring(startPos + 1, coordEndPos + 1);
                var area = null;
                if (CQ.form.HotspotImageMap.RectArea.isStringRepresentation(areaDef)) {
                    area = CQ.form.HotspotImageMap.RectArea.deserialize(areaDef);
                } else if (CQ.form.HotspotImageMap.PolyArea.isStringRepresentation(areaDef)) {
                    area = CQ.form.HotspotImageMap.PolyArea.deserialize(areaDef);
                } else if (CQ.form.HotspotImageMap.CircularArea.isStringRepresentation(areaDef)) {
                    area = CQ.form.HotspotImageMap.CircularArea.deserialize(areaDef);
                }
                if (area != null) {
                    var oldProcessingPos = processingPos;
                    processingPos =
                            area.destination.deserialize(strDefinition, coordEndPos + 1);
                    this.mapShapeSet.addShape(area);
                    if (processingPos == null) {
                        CQ.Log.error("CQ.form.HotspotImageMap#deserialize: Invalid map definition: " + strDefinition + "; trying to continue parsing.");
                        processingPos = strDefinition.indexOf("]", oldProcessingPos) + 3;
                    }
                } else {
                    CQ.Log.error("CQ.form.HotspotImageMap#deserialize: Invalid area definition string: " + areaDef);
                    processingPos = strDefinition.indexOf("]", processingPos) + 3;
                }
            }
        }
    },

    // overrides CQ.form.HotspotSmartImage.Tool#isEnabled
    isEnabled: function() {
        return this.imageComponent.usesProcessedImage();
    },

    /**
     * Adjusts the tool's button to the current state of the image component.
     * @private
     */
    adjustButtonToState: function() {
        var isEnabled = this.isEnabled()
                && (!this.imageComponent.editLock || this.imageComponent.editLockDisabled);
        this.buttonComponent.setDisabled(!isEnabled);
        this.buttonComponent.setTooltip(isEnabled ? null
                : CQ.I18n.getMessage("This action will become available once the image has been saved for the first time."))
    }

});

/*
 * Copyright 1997-2011 Day Management AG
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
 * @author syee@crownpartners.com
 * @class CQ.form.HotspotImageMap.UI
 * @extends CQ.form.SmartImage.Tool.UserInterface
 * @private
 * The HotspotImageMap.UI provides the external user interface
 * for the image map tool.
 * 
 * Please note: The user interface was heavily extended.
 * @constructor
 * Creates a new ImageMap.UI.
 * @param {Object} config The config object
 */
CQ.form.HotspotImageMap.UI = CQ.Ext.extend(CQ.form.SmartImage.Tool.UserInterface, {

    /**
     * Flag if the tool is currently active (managed by {@link CQ.form.HotspotImageMap})
     * @private
     * @type Boolean
     */
    isActive: false,

    /**
     * The basic working area
     * @private
     * @type CQ.form.SmartImage.ImagePanel
     */
    workingArea: null,

    /**
     * Current edit mode.
     * @private
     * @type Number
     */
    editMode: null,

    /**
     * Current area type.
     * @private
     * @type Number
     */
    areaType: null,

    /**
     * The latest polygon shape added
     * @private
     * @type CQ.form.HotspotImageMap.PolyArea
     */
    polyAreaAdded: null,

    /**
     * The {@link CQ.form.SmartImage.ShapeSet} used to display the map's areas.
     * @private
     * @type CQ.form.SmartImage.ShapeSet
     */
    mapShapeSet: null,


    constructor: function(config) {
        var clickHandler = function(item) {
            this.toolClicked(item.itemId);
        }.createDelegate(this);
        // as Ext does only save the CQ.Ext.Elements of toolbar items, we'll have to
        // keep references of the underlying buttons on our own
        this.toolbarButtons = {
            "addRect": new CQ.Ext.Toolbar.Button( {
                "itemId": "addRect",
                "text": CQ.I18n.getMessage("Rectangle"),
                "enableToggle": true,
                "toggleGroup": "mapperTools",
                "allowDepress": false,
                "handler": clickHandler
            } ),
            "addCircle": new CQ.Ext.Toolbar.Button( {
                "itemId": "addCircle",
                "text": CQ.I18n.getMessage("Circle"),
                "enableToggle": true,
                "toggleGroup": "mapperTools",
                "allowDepress": false,
                "handler": clickHandler
            } ),
            "addPoly": new CQ.Ext.Toolbar.Button( {
                "itemId": "addPoly",
                "text": CQ.I18n.getMessage("Polygon"),
                "enableToggle": true,
                "toggleGroup": "mapperTools",
                "allowDepress": false,
                "handler": clickHandler
            } ),
            "editPolyPoint": new CQ.Ext.Toolbar.Button( {
                "itemId": "editPolyPoint",
                "xtype": "tbbutton",
                "text": CQ.I18n.getMessage("Polygon point"),
                "enableToggle": true,
                "toggleGroup": "mapperTools",
                "allowDepress": false,
                "handler": clickHandler
            } ),
            "edit": new CQ.Ext.Toolbar.Button( {
                "itemId": "edit",
                "text": CQ.I18n.getMessage("Edit"),
                "enableToggle": true,
                "toggleGroup": "mapperTools",
                "allowDepress": false,
                "handler": clickHandler
            } )
        };

        var toolbar = new CQ.Ext.Toolbar( {
            "xtype": "toolbar",
            "items": [
                CQ.I18n.getMessage("Add") + ":",
                this.toolbarButtons["addRect"],
                this.toolbarButtons["addCircle"],
                this.toolbarButtons["addPoly"],
                this.toolbarButtons["editPolyPoint"],
                {
                    "xtype": "tbseparator"
                },
                this.toolbarButtons["edit"],
                {
                    "xtype": "tbseparator"
                }, {
                    "itemId": "delete",
                    "xtype": "tbbutton",
                    "text": CQ.I18n.getMessage("Delete"),
                    "handler": function() {
                        this.deleteSelection();
                    }.createDelegate(this)
                }
            ]
        } );
        var defaults = {
            "layout": "column",
            "bodyStyle": "padding-top: 1px; " +
                 "padding-bottom: 1px; " +
                 "padding-left: 3px; " +
                 "padding-right: 2px;",
            "width": CQ.themes.SmartImage.Tool.MAP_TOOLS_WIDTH,
            "tbar": toolbar,
            "items": [ {
                "itemId": "col1",
                "xtype": "panel",
                "layout": "form",
                "border": false,
                "columnWidth": 0.5,
                "labelWidth": CQ.themes.SmartImage.Tool.MAP_AREAEDITOR_LABEL_WIDTH,
                "defaults": {
                    "width": CQ.themes.SmartImage.Tool.MAP_AREAEDITOR_FIELD_WIDTH
                },
                "items": [ {
                    "itemId": "areaDefUrl",
                    "xtype": "gmdslinkdialog",
                    "fieldLabel": "HREF",
                    "editable": false,
                }, {
                    "itemId": "areaDefTarget",
                    "name": "target",
                    "xtype": "textfield",
                    "fieldLabel": "Target"
                }, {
                   "itemId": "areaDefCaptionText",
                   "name": "captiontext",
                   "xtype": "textarea",
                   "autoScroll": true,
                   "fieldLabel": "Caption Text",
                   "style" : {
                	   "minWidth" : "172px"
                   }
               } ]
            }, {
                "itemId": "col2",
                "xtype": "panel",
                "layout": "form",
                "border": false,
                "columnWidth": 0.5,
                "labelWidth": CQ.themes.SmartImage.Tool.MAP_AREAEDITOR_LABEL_WIDTH,
                "defaults": {
                    "width": CQ.themes.SmartImage.Tool.MAP_AREAEDITOR_FIELD_WIDTH
                },
                "items": [ {
                    "itemId": "areaDefText",
                    "name": "text",
                    "xtype": "textfield",
                    "fieldLabel": "Alt"
                }, {
                    "itemId": "areaDefCoords",
                    "name": "coords",
                    "xtype": "textfield",
                    "fieldLabel": "Coordinates"
                } ]
            } ]
        };
        CQ.Util.applyDefaults(config, defaults);
        CQ.form.HotspotImageMap.UI.superclass.constructor.call(this, config);
    },

    /**
     * Initializes the user interface's components.
     */
    initComponent: function() {
        CQ.form.HotspotImageMap.UI.superclass.initComponent.call(this);
        var linkFieldset = this.items.get("col1").items.get("areaDefUrl").dialog.items.get("linkpanel").items.get("linkfieldset").items;
        this.areaLinkTitle = linkFieldset.get("x-link-title-item");
        this.areaInternalLink = linkFieldset.get("x-internal-link-item");
        this.areaDeepLinkParam = linkFieldset.get("x-deeplink-param-item");
        this.areaInPageLink = linkFieldset.get("x-in-page-link-item");
        this.areaGlossaryLink = linkFieldset.get("x-glossary-link-item");
        this.areaDisclaimerLink = linkFieldset.get("x-disclaimer-link-item");
        this.areaExternalLink = linkFieldset.get("x-external-link-item");
        this.areaLinkParams = linkFieldset.get("x-link-params-item");
        this.areaDefTarget = this.items.get("col1").items.get("areaDefTarget");
        this.areaDefCaptionText = this.items.get("col1").items.get("areaDefCaptionText");
        this.areaDefText = this.items.get("col2").items.get("areaDefText");
        this.areaDefCoords = this.items.get("col2").items.get("areaDefCoords");
        this.areaDefCoords.on("specialkey", function(tf, keyEvent) {
            var editedArea = this.editedArea;
            if ((keyEvent.getKey() == CQ.Ext.EventObject.ENTER)
                    && (editedArea != null)) {
                if (editedArea.fromCoordString(this.areaDefCoords.getValue())) {
                    // var repaintAreas = [ editedArea ];
                    this.workingArea.drawImage();
                }
                this.areaDefCoords.setValue(editedArea.toCoordString());
            }
        }, this);
        this.setDestinationAreaEditorEnabled(false);
    },

    /**
     * Notifies the image map of the working area it is used on and the shape set it
     * must use for displaying the image area's shapes.
     * @param {CQ.form.SmartImage.ImagePanel} workingArea The working area
     * @param {CQ.form.SmartImage.ShapeSet} mapShapeSet The shape set
     */
    notifyWorkingArea: function(workingArea, mapShapeSet) {
        this.workingArea = workingArea;
        this.mapShapeSet = mapShapeSet;
        this.workingArea.on("addrequest", this.onAddRequest, this);
        this.workingArea.on("selectionchange", this.onSelectionChange, this);
        this.workingArea.on("dragchange", this.onVisualChange, this);
        this.workingArea.on("rollover", this.onRollover, this);
    },

    /**
     * Handler for clicks on tools (add rect/circle/polygon, edit, etc.).
     * @param {String} value The tool id ("edit", "editPolyPoint", "addRect", "addCircle",
     *        "addPoly")
     */
    toolClicked: function(value) {
        if (value == "edit") {
            this.switchEditMode(CQ.form.ImageMap.EDITMODE_EDIT, null);
        } else if (value == "editPolyPoint") {
            this.switchEditMode(
                    CQ.form.ImageMap.EDITMODE_EDIT,
                    CQ.form.ImageMap.AREATYPE_POINT);
        } else if (value == "addRect") {
            this.switchEditMode(
                    CQ.form.ImageMap.EDITMODE_ADD,
                    CQ.form.ImageMap.AREATYPE_RECT);
        } else if (value == "addCircle") {
            this.switchEditMode(
                    CQ.form.ImageMap.EDITMODE_ADD,
                    CQ.form.ImageMap.AREATYPE_CIRCLE);
        } else if (value == "addPoly") {
            this.switchEditMode(
                    CQ.form.ImageMap.EDITMODE_ADD,
                    CQ.form.ImageMap.AREATYPE_POLYGON);
        }
    },

    /**
     * Enables or disables the destination area editor.
     * @param {Boolean} isEnabled True to enable the destination area editor
     */
    setDestinationAreaEditorEnabled: function(isEnabled) {
    	this.areaLinkTitle.setDisabled(!isEnabled);
        this.areaInternalLink.setDisabled(!isEnabled);
        this.areaDeepLinkParam.setDisabled(!isEnabled);
        this.areaInPageLink.setDisabled(!isEnabled);
        this.areaDisclaimerLink.setDisabled(!isEnabled);
        this.areaGlossaryLink.setDisabled(!isEnabled);
        this.areaExternalLink.setDisabled(!isEnabled);
        this.areaLinkParams.setDisabled(!isEnabled);
        this.areaDefTarget.setDisabled(!isEnabled);
        this.areaDefText.setDisabled(!isEnabled);
        this.areaDefCoords.setDisabled(!isEnabled);
        this.areaDefCaptionText.setDisabled(!isEnabled);
    },

    /**
     * Saves the current content of the destination area editor to the specified image area.
     * @param {CQ.form.HotspotImageMap.Area} area Area to save data to
     */
    saveDestinationArea: function(area) {
        if (!area) {
            area = this.editedArea;
        }
        if (area) {
        	area.destination.target = this.areaDefTarget.getValue();
            area.destination.linkTitle = this.areaLinkTitle.getValue();
            area.destination.internalLink = this.areaInternalLink.getValue();
            area.destination.deepLinkParam = this.areaDeepLinkParam.getValue();
            area.destination.inPageLink = this.areaInPageLink.getValue();
            area.destination.disclaimerLink = this.areaDisclaimerLink.getValue();
            area.destination.glossaryLink = this.areaGlossaryLink.getValue();
            area.destination.externalLink = this.areaExternalLink.getValue();
            area.destination.linkParams = this.areaLinkParams.getValue();
            area.destination.text = this.areaDefText.getValue();
            area.destination.captionText = this.areaDefCaptionText.getValue();
        }
    },

    /**
     * Loads the current content of the destination area editor from the specified image
     * area.
     * @param {CQ.form.HotspotImageMap.Area} area area to load data from; null to clear the current
     *        content
     */
    loadDestinationArea: function(area) {
        if (area != null) {
        	this.areaDefTarget.setValue(area.destination.target);
            this.areaLinkTitle.setValue(area.destination.linkTitle);
            this.areaInternalLink.setValue(area.destination.internalLink);
            this.areaDeepLinkParam.setValue(area.destination.deepLinkParam);
            this.areaInPageLink.setValue(area.destination.inPageLink);
            this.areaDisclaimerLink.setValue(area.destination.disclaimerLink);
            this.areaGlossaryLink.setValue(area.destination.glossaryLink);
            this.areaExternalLink.setValue(area.destination.externalLink);
            this.areaLinkParams.setValue(area.destination.linkParams);
            this.areaDefText.setValue(area.destination.text);
            this.areaDefCoords.setValue(area.toCoordString());
            this.areaDefCaptionText.setValue(area.destination.captionText);
        } else {
        	this.areaDefTarget.setValue("");
            this.areaLinkTitle.setValue("");
            this.areaInternalLink.setValue("");
            this.areaDeepLinkParam.setValue("");
            this.areaInPageLink.setValue("");
            this.areaDisclaimerLink.setValue("");
            this.areaGlossaryLink.setValue("");
            this.areaExternalLink.setValue("");
            this.areaLinkParams.setValue(""); 
            this.areaDefText.setValue("");
            this.areaDefCoords.setValue("");
            this.areaDefCaptionText.setValue("");
        }
    },


    // Edit mode related stuff -------------------------------------------------------------

    /**
     * Switches edit mode.
     * @param {Number} editMode new edit mode; defined by constants with prefix
     *        EDITMODE_
     * @param {Number} areaType new area type (if applicable; for example the area to add);
     *        defined by constants with prefix AREATYPE_
     */
    switchEditMode: function(editMode, areaType) {
        this.editMode = editMode;
        this.areaType = areaType;
        this.adjustToolbar();
        if (this.editMode == CQ.form.ImageMap.EDITMODE_ADD) {
            this.finishPolygonBuilding(false);
            this.workingArea.blockRollOver();
            this.workingArea.clearSelection();
            this.workingArea.drawImage();
        } else if (this.editMode == CQ.form.ImageMap.EDITMODE_EDIT) {
            if (this.areaType != CQ.form.ImageMap.AREATYPE_POINT) {
                this.finishPolygonBuilding(false);
            }
            // repaintAreas = this.getSelectedAreas();
            this.workingArea.unblockRollOver();
            this.workingArea.drawImage();
        }
        if (!this.polyAreaAdded) {
            this.workingArea.drawImage();
        }
    },

    /**
     * Adjusts the toolbar to the current edit mode.
     * @private
     */
    adjustToolbar: function() {
        var valueToSelect = null;
        if (this.editMode == CQ.form.ImageMap.EDITMODE_EDIT) {
            if (this.areaType == CQ.form.ImageMap.AREATYPE_POINT) {
                valueToSelect = "editPolyPoint";
            } else {
                valueToSelect = "edit";
            }
        } else if (this.editMode == CQ.form.ImageMap.EDITMODE_ADD) {
            if (this.areaType == CQ.form.ImageMap.AREATYPE_RECT) {
                valueToSelect = "addRect";
            } else if (this.areaType == CQ.form.ImageMap.AREATYPE_POLYGON) {
                valueToSelect = "addPoly";
            } else if (this.areaType == CQ.form.ImageMap.AREATYPE_CIRCLE) {
                valueToSelect = "addCircle";
            }
        }
        for (var buttonId in this.toolbarButtons) {
            if (this.toolbarButtons.hasOwnProperty(buttonId)) {
                var item = this.toolbarButtons[buttonId];
                item.suspendEvents();
                item.toggle(buttonId == valueToSelect);
                item.resumeEvents();
            }
        }
    },

    /**
     * Deletes the currently selected areas and polygon points (if any).
     * @return {Boolean} True if at least one area has actually been deleted
     */
    deleteSelection: function() {
        // if there are any areas with polygon points selected, delete those points first
        var isHandleDeleted = false;
        var areaCnt = this.mapShapeSet.getShapeCount();
        for (var areaIndex = 0; areaIndex < areaCnt; areaIndex++) {
            var areaToCheck = this.mapShapeSet.getShapeAt(areaIndex);
            if (areaToCheck.areaType == CQ.form.ImageMap.AREATYPE_POLYGON) {
                if (areaToCheck.selectedHandle != null) {
                    areaToCheck.removePoint(areaToCheck.selectedHandle);
                    isHandleDeleted = true;
                }
            }
        }
        if (!isHandleDeleted) {
            // remove selected areas completely
            this.workingArea.deleteSelectedShapes();
        } else {
            this.workingArea.drawImage();
        }
    },

    /**
     * Finishes the building of a polygon (executed by the user).
     * @param {Boolean} requestRepaint True to request a repaint of the image; false if the
     *        redraw is executed later on
     * @private
     */
    finishPolygonBuilding: function(requestRepaint) {
        if (this.polyAreaAdded) {
            this.polyAreaAdded.isSelected = false;
            this.polyAreaAdded.selectedHandle = null;
            if (requestRepaint) {
                this.workingArea.drawImage();
            }
        }
        this.polyAreaAdded = null;
    },


    // Event handling ----------------------------------------------------------------------

    /**
     * Handles "add (something) requested (by user)".
     * @param {Object} coords Coordinates; properties: x, y
     */
    onAddRequest: function(coords) {
        if (this.isActive) {
            coords = coords.unzoomed;
            if (this.editMode == CQ.form.ImageMap.EDITMODE_ADD) {
                var shapeToAdd;
                if (this.areaType == CQ.form.ImageMap.AREATYPE_RECT) {
                    shapeToAdd = new CQ.form.HotspotImageMap.RectArea({ },
                        coords.y, coords.x, coords.y + 1, coords.x + 1);
                } else if (this.areaType == CQ.form.ImageMap.AREATYPE_CIRCLE) {
                    shapeToAdd = new CQ.form.HotspotImageMap.CircularArea({ },
                        coords.x, coords.y, 1);
                } else if (this.areaType == CQ.form.ImageMap.AREATYPE_POLYGON) {
                    shapeToAdd = new CQ.form.HotspotImageMap.PolyArea({ }, coords.x, coords.y);
                    shapeToAdd.selectPointAt(0);
                    this.polyAreaAdded = shapeToAdd;
                }
                if (shapeToAdd) {
                    this.workingArea.selectShape(shapeToAdd);
                    this.mapShapeSet.addShape(shapeToAdd);
                    this.workingArea.scheduleForDragging(shapeToAdd);
                }
            } else if ((this.editMode == CQ.form.ImageMap.EDITMODE_EDIT)
                    && (this.areaType == CQ.form.ImageMap.AREATYPE_POINT)) {
                // adding polygon point
                var polyToEdit;
                if (this.polyAreaAdded) {
                    polyToEdit = [ this.polyAreaAdded ];
                } else {
                    polyToEdit = this.workingArea.getRolledOverShapes();
                }
                var pointAdded;
                var isPointAdded = false;
                var blockAddPoint = false;
                var tolerance = this.workingArea.getTolerance();
                polyToEdit =
                    this.filterOnAreaType(polyToEdit, CQ.form.ImageMap.AREATYPE_POLYGON);
                if (polyToEdit.length > 0) {
                    var addCnt = polyToEdit.length;
                    for (var addIndex = 0; addIndex < addCnt; addIndex++) {
                        var polygonToProcess = polyToEdit[addIndex];
                        // add new point if no handle is selected, otherwise just move the
                        // existing handle
                        if (polygonToProcess.handleId == null) {
                            pointAdded = polygonToProcess.insertPoint(
                                    coords.x, coords.y, tolerance);
                            if (pointAdded != null) {
                                polygonToProcess.handleId = pointAdded;
                                polygonToProcess.selectPoint(pointAdded);
                                isPointAdded = true;
                            }
                        } else {
                            // use default move when added to a rolled over point
                            blockAddPoint = true;
                        }
                    }
                }
                // if we can neither insert the point on an existing edge of the shape nor
                // move an existing point, then we just add the point if we are building a
                // new polygon
                if (!isPointAdded && this.polyAreaAdded && !blockAddPoint) {
                    pointAdded = this.polyAreaAdded.addPoint(coords.x, coords.y);
                    if (pointAdded != null) {
                        this.polyAreaAdded.selectPoint(pointAdded);
                    }
                }
                this.workingArea.drawImage();
            }
        }
    },

    /**
     * Handles selection change events by adapting the "area destination" editor to the
     * selected areas.
     * @param {CQ.form.ImageMap.Area[]} selectedAreas list with currently selected areas
     * @private
     */
    onSelectionChange: function(selectedAreas) {
        if (this.isActive) {
            var logText =
                    "ImageMap#onSelectionChange: Received selection change for areas: ";
            if (selectedAreas.length > 0) {
                var selectionCnt = selectedAreas.length;
                for (var ndx = 0; ndx < selectionCnt; ndx++) {
                    if (ndx > 0) {
                        logText += ", ";
                    }
                    logText += selectedAreas[ndx].serialize();
                }
            } else {
                logText += "None";
            }
            CQ.Log.debug(logText);
            if (this.editedArea != null) {
                this.saveDestinationArea(this.editedArea);
            }
            if (selectedAreas.length == 1) {
                this.editedArea = selectedAreas[0];
                this.loadDestinationArea(this.editedArea);
                this.setDestinationAreaEditorEnabled(true);
            } else {
                this.editedArea = null;
                this.loadDestinationArea(null);
                this.setDestinationAreaEditorEnabled(false);
            }
        }
    },

    /**
     * Handles visual changes (such as move, add/remove polygon point).
     * @param {CQ.form.ImageMap.Area[]} changedAreas Array of areas that have changed (and
     *        hence must be updated)
     * @param {Boolean} isDragEnd True if the event signals the end of a drag operation
     * @private
     */
    onVisualChange: function(changedAreas, isDragEnd) {
        if (this.isActive) {
            var areaCnt = changedAreas.length;
            var coordStr;
            var isSet = false;
            for (var areaIndex = 0; areaIndex < areaCnt; areaIndex++) {
                if (changedAreas[areaIndex] == this.editedArea) {
                    coordStr = this.editedArea.toCoordString();
                    this.areaDefCoords.setValue(coordStr);
                    isSet = true;
                    break;
                }
            }
            if (!isSet && (changedAreas.length == 1)) {
                coordStr = changedAreas[0].toCoordString();
                this.areaDefCoords.setValue(coordStr);
            }
            if (isDragEnd && ((this.editMode == CQ.form.ImageMap.EDITMODE_ADD)
                    && (this.areaType == CQ.form.ImageMap.AREATYPE_POLYGON))) {
                this.switchEditMode(CQ.form.ImageMap.EDITMODE_EDIT,
                    CQ.form.ImageMap.AREATYPE_POINT);
            }
        }
    },

    /**
     * Handles rollover events.
     * @param {Array} rolloveredAreas list with currently "rolled over areas"
     * @private
     */
    onRollover: function(rolloveredAreas) {
        if (this.isActive) {
            var logText = "ImageMap#onRollover: Received rollover for areas: ";
            if (rolloveredAreas.length > 0) {
                var rolloverCnt = rolloveredAreas.length;
                for (var ndx = 0; ndx < rolloverCnt; ndx++) {
                    if (ndx > 0) {
                        logText += ", ";
                    }
                    logText += rolloveredAreas[ndx].serialize();
                }
            } else {
                logText += "None";
            }
            CQ.Log.debug(logText);
            if (this.editedArea == null) {
                if (rolloveredAreas.length == 1) {
                    this.loadDestinationArea(rolloveredAreas[0]);
                } else {
                    this.loadDestinationArea(null);
                }
            }
        }
    },


    // Helpers -----------------------------------------------------------------------------

    /**
     * Filters the specified list of areas for a specific area type.
     * @param {CQ.form.ImageMap.Area[]} listToFilter The area list to be filtered
     * @param {Number} areaType Area type to be recognized for the filtered list
     * @return {CQ.form.ImageMap.Area[]} The filtered list
     */
    filterOnAreaType: function(listToFilter, areaType) {
        var filteredAreas = new Array();
        var areaCnt = listToFilter.length;
        for (var areaNdx = 0; areaNdx < areaCnt; areaNdx++) {
            var areaToCheck = listToFilter[areaNdx];
            if (areaToCheck.areaType == areaType) {
                filteredAreas.push(areaToCheck);
            }
        }
        return filteredAreas;
    }

});

/*
 * Copyright 1997-2011 Day Management AG
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
 * @class CQ.form.ExtendedImageMap.AreaDestination
 * @private
 * This class defines the destination of an image map area. It consists of the target url,
 * the target window and a descriptive text.
 * @constructor
 * Creates a new ImageMap.AreaDestination.
 * @param {String} linkTitle (optional)
 * @param {String} internalLink (optional)
 * @param {String} deepLinkParam (optional)
 * @param {String} inPageLink (optional)
 * @param {String} disclaimerLink (optional)
 * @param {String} glossaryLink (optional)
 * @param {String} externalLink (optional)
 * @param {String} linkParams (optional) 
 * @param {String} target target frame of the area (optional)
 * @param {String} text descriptive text of the area (optional)
 * @param {String} caption text of the area (optional)
 */
CQ.form.HotspotImageMap.AreaDestination = CQ.Ext.extend(CQ.Ext.emptyFn, {

	/**
	 * @property {String} linkTitle
	 * The title of the link
	 * 
	 */
	linkTitle: null,

	/**
	 * @property {String} internalLink
	 * Where the image area needs to redirect to
	 */
    internalLink: null,

    /**
     * @property {String} deepLinkParam
     * Where the image area needs to deeplink to
     * 
     */
    deepLinkParam: null,
    
    /**
     * @property {String} inPageLink
     * Where the image area should link to
     * 
     */
    inPageLink: null,
    
    /**
     * @property {String} disclaimerLink
     * 
     */
    disclaimerLink: null,
    
    /**
     * @property {String} glossaryLink
     * 
     */
    glossaryLink: null,
    
    /**
     * @property {String} externalLink
     * Where the image area needs to redirect to
     */
    externalLink: null,
    
    /**
     * @property {String} linkParams
     * 
     */
    linkParams: null,

    /**
     * @property {String} target
     * The target attribute of the image area
     */
    target: null,

    /**
     * @property {String} text (alt text)
     * Descriptive text for the image area
     */
    text: null,
    
    /**
     * @property {String} captionText
     * Caption Text for the image area
     */
    captionText: null,

    constructor: function(target, linkTitle, internalLink, deepLinkParam, inPageLink, disclaimerLink, glossaryLink, externalLink, linkParams, text, captionText) {
        this.target = (target ? target : "");
    	this.linkTitle = (linkTitle ? linkTitle : "");
        this.internalLink = (internalLink ? internalLink : "");
        this.deepLinkParam = (deepLinkParam ? deepLinkParam : "");
        this.inPageLink = (inPageLink ? inPageLink : "");
        this.disclaimerLink = (disclaimerLink ? disclaimerLink : "");
        this.glossaryLink = (glossaryLink ? glossaryLink : "");
        this.externalLink = (externalLink ? externalLink : "");
        this.linkParams = (linkParams ? linkParams : "");
        this.text = (text ? text : "");
        this.captionText = (captionText ? captionText : "");
        
    },

    /**
     * Creates a string representation of the destination (used for serialization).
     * @return {String} A string representation of the destination
     */
    serialize: function() {
        var dump = "";
        if (this.target && (this.target.length > 0)) {
            dump += "\"" + CQ.form.ImageMap.Helpers.encodeString(this.target) + "\"";
        }
        dump += "~";
        if (this.linkTitle && (this.linkTitle.length > 0)) {
            dump += "\"" + CQ.form.ImageMap.Helpers.encodeString(this.linkTitle) + "\"";
        }
        dump += "~";
        if (this.internalLink && (this.internalLink.length > 0)) {
            dump += "\"" + CQ.form.ImageMap.Helpers.encodeString(this.internalLink) + "\"";
        }
        dump += "~";
        if (this.deepLinkParam && (this.deepLinkParam.length > 0)) {
            dump += "\"" + CQ.form.ImageMap.Helpers.encodeString(this.deepLinkParam) + "\"";
        }
        dump += "~";
        if (this.inPageLink && (this.inPageLink.length > 0)) {
            dump += "\"" + CQ.form.ImageMap.Helpers.encodeString(this.inPageLink) + "\"";
        }
        dump += "~";
        if (this.disclaimerLink && (this.disclaimerLink.length > 0)) {
            dump += "\"" + CQ.form.ImageMap.Helpers.encodeString(this.disclaimerLink) + "\"";
        }
        dump += "~";
        if (this.glossaryLink && (this.glossaryLink.length > 0)) {
            dump += "\"" + CQ.form.ImageMap.Helpers.encodeString(this.glossaryLink) + "\"";
        }
        dump += "~";
        if (this.externalLink && (this.externalLink.length > 0)) {
            dump += "\"" + CQ.form.ImageMap.Helpers.encodeString(this.externalLink) + "\"";
        }
        dump += "~";
        if (this.linkParam && (this.linkParam.length > 0)) {
            dump += "\"" + CQ.form.ImageMap.Helpers.encodeString(this.linkParam) + "\"";
        }
        dump += "~";
        if (this.text && (this.text.length > 0)) {
            dump += "\"" + CQ.form.ImageMap.Helpers.encodeString(this.text) + "\"";
        }
        dump += "~";
        if (this.captionText && (this.captionText.length > 0)) {
            dump += "\"" + CQ.form.ImageMap.Helpers.encodeString(this.captionText) + "\"";
        }
        return dump;
    },

    /**
     * <p>Sets the destination from the specified image map string (full version).</p>
     * <p>The format is as defined by {@link #serialize}.</p>
     * @param {String} value The image map definition (full version)
     * @param {Number} parseStartPos Start position (in value) where the destination has to
     *        be parsed from
     * @return {Number} The character position that follows the parsed text; null if the
     *         destination could not be parsed correctly
     */
    deserialize: function(value, parseStartPos) {
        var parsePos = parseStartPos;
        var parseResult, charToCheck;
        if (parsePos < value.length) {
            charToCheck = value.charAt(parsePos);
            if (charToCheck != "~") {
                parseResult =
                    CQ.form.ImageMap.Helpers.decodeFromContainingString(value, parsePos);
                if (parseResult == null) {
                    return null;
                } else {
                    this.target = parseResult.decoded;
                    parsePos = parseResult.nextPos;
                }
            }
            parsePos++;
        }
        if (parsePos < value.length) {
            charToCheck = value.charAt(parsePos);
            if (charToCheck != "~") {
                parseResult =
                    CQ.form.ImageMap.Helpers.decodeFromContainingString(value, parsePos);
                if (parseResult == null) {
                    return null;
                } else {
                    this.linkTitle = parseResult.decoded;
                    parsePos = parseResult.nextPos;
                }
            }
            parsePos++;
        }
        if (parsePos < value.length) {
            charToCheck = value.charAt(parsePos);
            if (charToCheck != "~") {
                parseResult =
                    CQ.form.ImageMap.Helpers.decodeFromContainingString(value, parsePos);
                if (parseResult == null) {
                    return null;
                } else {
                    this.internalLink = parseResult.decoded;
                    parsePos = parseResult.nextPos;
                }
            }
            parsePos++;
        }
        if (parsePos < value.length) {
            charToCheck = value.charAt(parsePos);
            if (charToCheck != "~") {
                parseResult =
                    CQ.form.ImageMap.Helpers.decodeFromContainingString(value, parsePos);
                if (parseResult == null) {
                    return null;
                } else {
                    this.deepLinkParam = parseResult.decoded;
                    parsePos = parseResult.nextPos;
                }
            }
            parsePos++;
        }
        if (parsePos < value.length) {
            charToCheck = value.charAt(parsePos);
            if (charToCheck != "~") {
                parseResult =
                    CQ.form.ImageMap.Helpers.decodeFromContainingString(value, parsePos);
                if (parseResult == null) {
                    return null;
                } else {
                    this.inPageLink = parseResult.decoded;
                    parsePos = parseResult.nextPos;
                }
            }
            parsePos++;
        }
        if (parsePos < value.length) {
            charToCheck = value.charAt(parsePos);
            if (charToCheck != "~") {
                parseResult =
                    CQ.form.ImageMap.Helpers.decodeFromContainingString(value, parsePos);
                if (parseResult == null) {
                    return null;
                } else {
                    this.disclaimerLink = parseResult.decoded;
                    parsePos = parseResult.nextPos;
                }
            }
            parsePos++;
        }
        if (parsePos < value.length) {
            charToCheck = value.charAt(parsePos);
            if (charToCheck != "~") {
                parseResult =
                    CQ.form.ImageMap.Helpers.decodeFromContainingString(value, parsePos);
                if (parseResult == null) {
                    return null;
                } else {
                    this.glossaryLink = parseResult.decoded;
                    parsePos = parseResult.nextPos;
                }
            }
            parsePos++;
        }
        if (parsePos < value.length) {
            charToCheck = value.charAt(parsePos);
            if (charToCheck != "~") {
                parseResult =
                    CQ.form.ImageMap.Helpers.decodeFromContainingString(value, parsePos);
                if (parseResult == null) {
                    return null;
                } else {
                    this.externalLink = parseResult.decoded;
                    parsePos = parseResult.nextPos;
                }
            }
            parsePos++;
        }
        if (parsePos < value.length) {
            charToCheck = value.charAt(parsePos);
            if (charToCheck != "~") {
                parseResult =
                    CQ.form.ImageMap.Helpers.decodeFromContainingString(value, parsePos);
                if (parseResult == null) {
                    return null;
                } else {
                    this.linkParams = parseResult.decoded;
                    parsePos = parseResult.nextPos;
                }
            }
            parsePos++;
        }
        if (parsePos < value.length) {
            charToCheck = value.charAt(parsePos);
            if (charToCheck != "~") {
                parseResult =
                    CQ.form.ImageMap.Helpers.decodeFromContainingString(value, parsePos);
                if (parseResult == null) {
                    return null;
                } else {
                    this.text = parseResult.decoded;
                    parsePos = parseResult.nextPos;
                }
            }
            parsePos++;
        }
        if (parsePos < value.length) {
            charToCheck = value.charAt(parsePos);
            if (charToCheck != "]") {
                parseResult =
                    CQ.form.ImageMap.Helpers.decodeFromContainingString(value, parsePos);
                if (parseResult == null) {
                    return null;
                } else {
                    this.captionText = parseResult.decoded;
                    parsePos = parseResult.nextPos;
                }
            }
        }
        return parsePos + 3;
    }

});

/*
 * Copyright 1997-2011 Day Management AG
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
 * @author syee@crownpartners.com
 * @class CQ.form.HotspotImageMap.Area
 * @extends CQ.form.SmartImage.Shape
 * @private
 * The CQ.form.HotspotImageMap.Area is the basic class used for implementing the area types of an
 * image map.
 * 
 * Please note: The only thing modified on this file (compared to Day CQ's CQ.form.ImageMap.Area)
 * is that it uses the HotspotSmartImage's AreaDestination.js instead of SmartImage's AreaDestination.js.
 * 
 * @constructor
 * Creates a new ImageMap.Area.
 * @param {Number} areaType area type to create
 * @param {Object} config The config object
 */
CQ.form.HotspotImageMap.Area = CQ.Ext.extend(CQ.form.SmartImage.Shape, {

    /**
     * Type of the area; as represented by constants with prefix CQ.form.HotspotImageMap.AREATYPE_
     * @type String
     * @private
     */
    areaType: null,

    /**
     * Destination of the area.
     * @type CQ.form.HotspotImageMap.AreaDestination
     * @private
     */
    destination: null,

    /**
     * @cfg {String} fillColor Fill color
     */
    fillColor: null,

    /**
     * @cfg {String} shadowColor "Shadow" color
     */
    shadowColor: null,

    /**
     * @cfg {String} basicShapeColor Basic color
     */
    basicShapeColor: null,

    /**
     * @cfg {String} rolloverColor Rollover color
     */
    rolloverColor: null,

    /**
     * @cfg {String} selectedColor Selection color
     */
    selectedColor: null,

    /**
     * @cfg {Number} handleSize The size of a "Handle"
     */
    handleSize: 0,

    /**
     * @cfg {String} handleColor "Handle" color
     */
    handleColor: null,

    /**
     * @cfg {String} handleRolloverColor "Handle" color when rolled over
     */
    handleRolloverColor: null,

    /**
     * @cfg {String} handleSelectedColor "Handle" color when selected
     */
    handleSelectedColor: null,

    /**
     * Flag if the area is currently rolled over
     * @type Boolean
     * @private
     */
    isRollOver: false,

    /**
     * Flag if the area is currently selected
     * @type Boolean
     * @private
     */
    isSelected: false,

    /**
     * Flag if a Handle is rolled over
     * @type Boolean
     * @private
     */
    isHandleRolledOver: false,

    /**
     * Currently rolled over handle
     * @type Object
     * @private
     */
    handleId: null,


    // Lifecycle ---------------------------------------------------------------------------

    constructor: function(areaType, config) {
        this.areaType = areaType;
        this.destination = new CQ.form.HotspotImageMap.AreaDestination();
        this.handleId = null;
        this.isSelected = false;
        this.isRollOver = false;
        config = config || { };
        var defaults = {
            "fillColor": CQ.themes.ImageMap.FILL_COLOR,
            "shadowColor": CQ.themes.ImageMap.SHADOW_COLOR,
            "basicShapeColor": CQ.themes.ImageMap.BASIC_SHAPE_COLOR,
            "rolloverColor": CQ.themes.ImageMap.ROLLOVER_COLOR,
            "selectedColor": CQ.themes.ImageMap.SELECTED_COLOR,
            "handleSize": CQ.themes.ImageMap.HANDLE_SIZE,
            "handleColor": CQ.themes.ImageMap.HANDLE_COLOR,
            "handleRolloverColor": CQ.themes.ImageMap.HANDLE_ROLLOVER_COLOR,
            "handleSelectedColor": CQ.themes.ImageMap.HANDLE_SELECTED_COLOR
        };
        CQ.Ext.apply(this, config, defaults);
    },


    // Helpers -----------------------------------------------------------------------------

    /**
     * Checks if the specified coordinates touch the specified handle coordinates.
     * @param {Number} handleX The horizontal position of the handle
     * @param {Number} handleY The vertical position of the handle
     * @param {Object} coords Coordinates to check; properties: x, y
     * @return True if the specified coordinates touch the handle coordinates
     */
    isPartOfHandle: function(handleX, handleY, coords) {
        var absZoom = (coords.unzoomed.absoluteZoom + 1);
        var absHandleSize = Math.ceil(this.handleSize / absZoom);
        var x1 = handleX - absHandleSize;
        var x2 = handleX + absHandleSize;
        var y1 = handleY - absHandleSize;
        var y2 = handleY + absHandleSize;
        coords = coords.unzoomedUnclipped;
        return ((coords.x >= x1) && (coords.x <= x2)
                && (coords.y >= y1) && (coords.y <= y2));
    },

    /**
     * Checks if any of the four edges is rolled over (which leads to a point move instead
     * of a shape move) for the specified coordinates and sets the handleId property
     * accordingly.
     * @param {Object} coords The coordinates to check; properties: x, y
     * @return {Boolean} True if a handle is rolled over for the specified coordinates
     */
    checkAndSetHandle: function(coords) {
        this.handleId = this.calculateHandleId(coords);
        return (this.handleId != null);
    },

    /**
     * Calculates the basic angle (= the angle before any rotation is applied).
     * @param {Number} angle The angle to rotate by (in degrees)
     * @param {Number} absAngle The absolute angle after rotation (in degrees)
     * @return {Number} The absolute angle before rotation (in degrees; values: 0 .. 359)
     */
    calcBasicAngle: function(angle, absAngle) {
        var basicAngle = absAngle - angle;
        while (basicAngle < 0) {
            basicAngle = 360 - basicAngle;
        }
        basicAngle = basicAngle % 360;
        return basicAngle;
    },


    // Interface implementation ------------------------------------------------------------

    /**
     * <p>Default implementation to detect if a single point should be moved when dragged
     * from the specified coordinates.</p>
     * <p>Point moves don't require the user to drag a certain distance before the dragging
     * starts, so this is implemented as a "direct" drag operation.</p>
     * @param {Object} coords The coordinates; properties: x, y
     * @param {Number} tolerance The tolerance distance used
     */
    isDirectlyDraggable: function(coords, tolerance) {
        return this.checkAndSetHandle(coords);
    },

    /**
     * <p>Default implementation to detect if the area as a whole should be moved when
     * dragged from the specified coordinates.</p>
     * <p>As {@link #isDirectlyDraggable} is called first, we don't have to check
     * if a point move is more suitable (as this is done by the method mentioned before).
     * </p>
     * @param {Object} coords The coordinates to check
     * @param {Number} tolerance The tolerance distance
     * @return {Boolean} True if the area should be moved
     */
    isDeferredDraggable: function(coords, tolerance) {
        return this.isTouched(coords, tolerance);
    },

    /**
     * Default implementation for rollOver events. Sets the state accordingly and requests
     * a redraw of the area in its new state.
     * @param {Object} coords Mouse pointer coordinates of the rollover (properties: x, y)
     * @return {Boolean} True to request a redraw of the area
     */
    onRollOver: function(coords) {
        this.isRollOver = true;
        this.isHandleRolledOver = this.checkAndSetHandle(coords);
        CQ.Log.debug("CQ.form.HotspotImageMap.Area.onRollOver: rollover detected.");
        return true;
    },

    /**
     * Default implementation for rolledOver events. Checks if a handle is now selected
     * and adjusts the state accordingly.
     * @param {Object} coords Current mouse pointer coordinates (properties: x, y)
     */
    onRolledOver: function(coords) {
        var oldHandle = this.handleId;
        this.checkAndSetHandle(coords);
        return (oldHandle != this.handleId);
    },

    /**
     * Default implementation for rollOut events. Sets the state accordingly and requests
     * a redraw of the area in its new state.
     * @return {Boolean} True to request a redraw of the area
     */
    onRollOut: function() {
        this.isRollOver = false;
        this.isHandleRolledOver = false;
        this.handleId = null;
        CQ.Log.debug("CQ.form.HotspotImageMap.Area.onRollOut: rollout detected.");
        return true;
    },

    /**
     * Default implementation for select events. Sets the state accordingly and requests
     * a redraw of the area in its new state.
     * @return {Boolean} True to request a redraw of the area
     */
    onSelect: function() {
        this.isSelected = true;
        return true;
    },

    /**
     * Default implementation for unselect events. Sets the state accordingly and requests
     * a redraw of the area in its new state.
     * @return {Boolean} True to request a redraw of the area
     */
    onUnSelect: function() {
        this.isSelected = false;
        return true;
    },

    /**
     * Handler that is called when a drag operation starts. It detects if a point move or a
     * shape move has to be executed.
     * @param {Object} coords Mouse pointer coordinates where dragging starts (properties:
     *        x, y)
     * @param {Number} tolerance The tolerance distance
     */
    onDragStart: function(coords, tolerance) {
        this.pointToMove = this.handleId;
        this.calculateDraggingReference();
        return false;
    },

    /**
     * <p>Calculates actual coordinates from the specified offsets that relate to the
     * specified base coordinates.<p>
     * <p>If bounds is specified, it is ensured that the returned destination coordinates
     * are inside the specified boundaries.</p>
     * @param {Number} xOffs The horizontal offset (relative to (baseCoords)
     * @param {Number} yOffs The vertical offset (relative to baseCoords)
     * @param {Object} baseCoords The base coordinates (specified by properties x, y)
     * @param {Object} bounds (optional) bounds for the destination coordinates (specified
     *        by properties width, height)
     * @return {Object} actual destination coordinates (specified by properties x, y)
     */
    calculateDestCoords: function(xOffs, yOffs, baseCoords, bounds) {
        var destX = baseCoords.x + xOffs;
        var destY = baseCoords.y + yOffs;
        if (bounds) {
            if (destX < 0) {
                destX = 0;
            }
            if (destX >= bounds.width) {
                destX = bounds.width - 1;
            }
            if (destY < 0) {
                destY = 0;
            }
            if (destY >= bounds.height) {
                destY = bounds.height - 1;
            }
        }
        return {
            "x": destX,
            "y": destY
        };
    },


    // Additional interface ----------------------------------------------------------------

    /**
     * This method must checks if the area is valid.
     * @param {Object} coords Coordinates to check (properties: x, y)
     * @return {Boolean} True if the area is valid
     */
    isValid: function(coords) {
        // This method must be overridden by the implementing classes
        return false;
    },

    /**
     * <p>This method must calculate the handle id for the specified coordinates.</p>
     * <p><i>This method must not change the handleId property!</i></p>
     * @param {Object} coords coordinates to calculate handle ID for; properties: x, y
     * @return {Object} handle id (implementation specific) or null if no handle is at that
     *         coordinates
     */
    calculateHandleId: function(coords) {
        // this method must be overriden by the implementing class
        return null;
    },

    /**
     * <p>This method must calculate the dragging reference and must be overridden by each
     * implementation of {@link CQ.form.HotspotImageMap.Area}.</p>
     * <p>The implementing class must set the dragging reference coordinates for the current
     * value of the pointToMove property. The way the dragging reference is calculated is
     * implementation-specific and must suit the way coordinate calculation is done
     * by the specific {@link #moveShapeBy} implementation.</p>
     */
    calculateDraggingReference: function() {
        // must be overriden by implementing classes
    },

    /**
     * <p>This method must be implemented to rotate the area by the specified angle.</p>
     * <p>Currently, only multiples of 90 must be supported.</p>
     * @param {Number} angle The angle (degrees; clockwise) the area has to be rotated by
     * @param {Number} absAngle The absolute angle (degrees) the area has to be rotated to
     * @param {Object} imageSize size of image (original, unrotated); properties: width,
     *        height
     */
    rotateBy: function(angle, absAngle, imageSize) {
        // must be overridden by implementing class
    },

    // Drawing helpers ---------------------------------------------------------------------

    /**
     * Get the color that has to be used for drawing the area itself, according to the
     * current area state.
     * @return {String} The color to be used for the drawing of the area; todo format?
     */
    getColor: function() {
        var color = this.basicShapeColor;
        if (this.isSelected) {
            color = this.selectedColor;
        } else if (this.isRollOver) {
            color = this.rolloverColor;
        }
        return color;
    },

    /**
     * <p>Draws a handle for the specified point.</p>
     * <p><i>To avoid unnecessary calculations, this method takes display coordinates, not
     * unzoomed coordinates!</i></p>
     * @param {Number} x The horizontal position of the point for which the handle has to be
     *        drawn
     * @param {Number} y The vertical position of the point for which the handle has to be
     *        drawn
     * @param {Boolean} isRolledOver True if the handle has to be drawn in "rollover" state
     * @param {Boolean} isSelected True if the handle has to be drawn in "selected" state
     * @param {CanvasRenderingContext2D} ctx canvas context on which to draw
     */
    drawHandle: function(x, y, isRolledOver, isSelected, ctx) {
        var baseX = x - this.handleSize;
        var baseY = y - this.handleSize;
        var extension = this.handleSize * 2;
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.shadowColor;
        ctx.strokeRect(baseX + 1, baseY + 1, extension, extension);
        if (isSelected) {
            ctx.strokeStyle = this.handleSelectedColor;
        } else if (isRolledOver) {
            ctx.strokeStyle = this.handleRolloverColor;
        } else {
            ctx.strokeStyle = this.handleColor;
        }
        ctx.strokeRect(baseX, baseY, extension, extension);
    }

});
/*
 * Copyright 1997-2011 Day Management AG
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
 * @author syee@crownpartners.com
 * @class CQ.form.HotspotImageMap.RectArea
 * @extends CQ.form.HotspotImageMap.Area
 * @private
 * This class represents a rectangular area of the image map.
 * @constructor
 * Creates a new ImageMap.RectArea.
 * @param {Number} top top edge of image area (incl.)
 * @param {Number} left left edge of image area (incl.)
 * @param {Number} bottom bottom edge of image area (incl.)
 * @param {Number} right right edge of image area (incl.)
 */
CQ.form.HotspotImageMap.RectArea = CQ.Ext.extend(CQ.form.HotspotImageMap.Area, {

    constructor: function(config, top, left, bottom, right) {
        CQ.form.HotspotImageMap.RectArea.superclass.constructor.call(this,
                CQ.form.ImageMap.AREATYPE_RECT, config);
        this.top = top;
        this.left = left;
        this.bottom = bottom;
        this.right = right;
    },

    /**
     * <p>Checks if the specified coordinates "belong" to the image area.</p>
     * <p>Currently, the borders of the rectangular area are checked for this.</p>
     * @param {Object} coords Coordinates to check; properties: x, y
     * @param {Number} tolerance The tolerance distance to be considered
     * @return {Boolean} True if the specified coordinates "belong" to the image area
     */
    isTouched: function(coords, tolerance) {
        var handleId = this.calculateHandleId(coords);
        if (handleId != null) {
            return true;
        }
        coords = coords.unzoomedUnclipped;
        // check top border
        var top1 = this.top - tolerance;
        var top2 = this.top + tolerance;
        if ((coords.y >= top1) && (coords.y <= top2)) {
            if ((coords.x >= this.left) && (coords.x <= this.right)) {
                return true;
            }
        }
        // check bottom border
        var bottom1 = this.bottom - tolerance;
        var bottom2 = this.bottom + tolerance;
        if ((coords.y >= bottom1) && (coords.y <= bottom2)) {
            if ((coords.x >= this.left) && (coords.x <= this.right)) {
                return true;
            }
        }
        // check left border
        var left1 = this.left - tolerance;
        var left2 = this.left + tolerance;
        if ((coords.x >= left1) && (coords.x <= left2)) {
            if ((coords.y >= this.top) && (coords.y <= this.bottom)) {
                return true;
            }
        }
        // check right border
        var right1 = this.right - tolerance;
        var right2 = this.right + tolerance;
        if ((coords.x >= right1) && (coords.x <= right2)) {
            if ((coords.y >= this.top) && (coords.y <= this.bottom)) {
                return true;
            }
        }
        return false;
    },

    /**
     * Calulates a suitable dragging reference.
     */
    calculateDraggingReference: function() {
        if ((this.pointToMove == "topleft") || (this.pointToMove == null)) {
            this.draggingReference = {
                "x": this.left,
                "y": this.top
            };
        } else if (this.pointToMove == "topright") {
            this.draggingReference = {
                "x": this.right,
                "y": this.top
            };
        } else if (this.pointToMove == "bottomleft") {
            this.draggingReference = {
                "x": this.left,
                "y": this.bottom
            };
        } else if (this.pointToMove == "bottomright") {
            this.draggingReference = {
                "x": this.right,
                "y": this.bottom
            };
        }
    },

    /**
     * Moves the shape or the point by the specified offsets.
     * @param {Number} xOffs The horizontal offset
     * @param {Number} yOffs The vertical offset
     */
    moveShapeBy: function(xOffs, yOffs, coords) {
        var imageSize = coords.unzoomed.rotatedImageSize;
        var destCoords =
                this.calculateDestCoords(xOffs, yOffs, this.draggingReference, imageSize);
        if (this.pointToMove == null) {
            var width = this.right - this.left;
            this.left = destCoords.x;
            this.right = this.left + width;
            var height = this.bottom - this.top;
            this.top = destCoords.y;
            this.bottom = this.top + height;
            if (this.right >= imageSize.width) {
                var delta = this.right - imageSize.width + 1;
                this.left -= delta;
                this.right -= delta;
            }
            if (this.bottom >= imageSize.height) {
                delta = this.bottom - imageSize.height + 1;
                this.top -= delta;
                this.bottom -= delta;
            }
        } else if (this.pointToMove == "topleft") {
            this.left = destCoords.x;
            this.top = destCoords.y;
        } else if (this.pointToMove == "topright") {
            this.right = destCoords.x;
            this.top = destCoords.y;
        } else if (this.pointToMove == "bottomleft") {
            this.left = destCoords.x;
            this.bottom = destCoords.y;
        } else if (this.pointToMove == "bottomright") {
            this.right = destCoords.x;
            this.bottom = destCoords.y;
        }
        return true;
    },

    /**
     * Ensures the correct coordinates (left may become right and top may become button
     * through the dragging operation).
     */
    onDragEnd: function() {
        var swap;
        if (this.top > this.bottom) {
            swap = this.top;
            this.top = this.bottom;
            this.bottom = swap;
        }
        if (this.left > this.right) {
            swap = this.left;
            this.left = this.right;
            this.right = swap;
        }
    },

    /**
     * Calculates the handle id for the specified coordinates.
     * @param {Object} coords The coordinates to calculate the handle ID for
     */
    calculateHandleId: function(coords) {
        if (this.isPartOfHandle(this.left, this.top, coords)) {
            return "topleft";
        }
        if (this.isPartOfHandle(this.right, this.top, coords)) {
            return "topright";
        }
        if (this.isPartOfHandle(this.left, this.bottom, coords)) {
            return "bottomleft";
        }
        if (this.isPartOfHandle(this.right, this.bottom, coords)) {
            return "bottomright";
        }
        return null;
    },

    /**
     * Checks if the area is correct (width and height are &lt; 0).
     * @return {Boolean} True if the area is correct
     */
    isValid: function() {
        return (this.top != this.bottom) && (this.left != this.right);
    },

    /**
     * <p>Rotates the area by the specified angle.</p>
     * <p>Currently, only multiples of 90 (degrees) are supported.</p>
     * @param {Number} angle The angle (degrees; clockwise) the area has to be rotated by
     * @param {Number} absAngle The absolute angle (degrees) the area has to be rotated to
     * @param {Object} imageSize The size of the image (original, unrotated; properties:
     *        width, height)
     */
    rotateBy: function(angle, absAngle, imageSize) {
        var tempTop;
        var tempBottom;
        // calculate basic angle
        var basicAngle = this.calcBasicAngle(angle, absAngle);
        var margin = ((basicAngle == 90) || (basicAngle == 270)
                ? imageSize.width : imageSize.height);
        // rotate in 90 degree steps
        var steps = Math.round(angle / 90);
        for (var step = 0; step < steps; step++) {
            tempTop = this.top;
            tempBottom = this.bottom;
            this.top = this.left;
            this.bottom = this.right;
            this.right = margin - tempTop;
            this.left = margin - tempBottom;
        }
    },

    /**
     * Sets the correct handle for dragging the rectangle after adding it.
     * @param {Object} coords Coordinates (properties: x, y)
     */
    onAddForDrag: function(coords) {
        this.handleId = "bottomright";
    },

    /**
     * Redraws the rectangular image area on the specified canvas context.
     * @param {CanvasRenderingContext2D} ctx The context to be used for drawing
     * @param {Number} zoom The real zoom factor (1.0 means that the original size should be
     *        used)
     * @param {Object} offsets Drawing offsets; properties: srcX, srcY, destX, destY,
     *        imageSize, zoomedSize; (see {@link CQ.form.SmartImage.Shape#draw})
     */
    draw: function(ctx, zoom, offsets) {
        CQ.Log.debug("CQ.form.HotspotImageMap.RectArea#draw: Started.");
        // reduce drawing to a minimum if IE is used and dragging is done
        var width = this.right - this.left;
        var height = this.bottom - this.top;
        var rectLeft = this.left;
        var rectTop = this.top;
        if (width < 0) {
            width = -width;
            rectLeft = this.right;
        } else if (width == 0) {
            width = 1;
        }
        if (height < 0) {
            height = -height;
            rectTop = this.bottom;
        } else if (height == 0) {
            height = 1;
        }
        var coords = this.calculateDisplayCoords(zoom, offsets, rectLeft, rectTop);
        var size = this.calculateDisplaySize(zoom, width, height);
        var coords2 = {
            "x": coords.x + size.width,
            "y": coords.y + size.height
        };
        if (this.fillColor) {
            ctx.fillStyle = this.fillColor;
            ctx.fillRect(coords.x, coords.y, size.width, size.height);
        }
        var drawHandle = (this.isRollOver);
        if (drawHandle) {
            this.drawHandle(coords.x, coords.y,
                    (this.handleId == "topleft"), false, ctx);
            this.drawHandle(coords2.x, coords.y,
                    (this.handleId == "topright"), false, ctx);
            this.drawHandle(coords.x, coords2.y,
                    (this.handleId == "bottomleft"), false, ctx);
            this.drawHandle(coords2.x, coords2.y,
                    (this.handleId == "bottomright"), false, ctx);
        }
        ctx.strokeStyle = this.getColor();
        ctx.lineWidth = 1;
        ctx.strokeRect(coords.x, coords.y, size.width,  size.height);
        CQ.Log.debug("CQ.form.HotspotImageMap.RectArea#draw: Finished.");
    },

    /**
     * Creates a String representation of the area.
     * @return {String} The String representation of the area
     */
    serialize: function() {
        return "rect("+ this.left + "," + this.top + "," + this.right + ","
                + this.bottom + ")" + this.destination.serialize();
    },

    /**
     * Creates a String representation of the area's coordinates (may be edited by user).
     * @return {String} The String representation of the area's coordinates
     */
    toCoordString: function() {
        return "(" + this.left + "/" + this.top + ") (" + this.right + "/" + this.bottom
                + ")";
    },

    /**
     * <p>Sets the rectangle according to the specified coordinate string representation.
     * </p>
     * <p>Note that the area must be repainted to reflect the changes visually.</p>
     * @param {String} coordStr coordinates string
     * @return {Boolean} True if the area could be adapted to the string; false if the
     *         string could not be parsed
     */
    fromCoordString: function(coordStr) {
        var coordDef = CQ.form.ImageMap.Helpers.parseCoordinateString(coordStr);
        if (coordDef == null) {
            return false;
        }
        var coords = coordDef.coordinates;
        if ((coords.length != 2) || (coordDef.coordinatesPairCnt != 2)) {
            return false;
        }
        var x1 = coords[0].x;
        var y1 = coords[0].y;
        var x2 = coords[1].x;
        var y2 = coords[1].y;
        if (x1 == x2) {
            return false;
        }
        if (y1 == y2) {
            return false;
        }
        // todo implement more validation code?
        if (x1 < x2) {
            this.left = x1;
            this.right = x2;
        } else {
            this.left = x2;
            this.right = x1;
        }
        if (y1 < y2) {
            this.top = y1;
            this.bottom = y2;
        } else {
            this.top = y2;
            this.bottom = y1;
        }
        return true;
    }

});

/**
 * <p>Checks if the specified string contains the definition of a polygonal area.</p>
 * <p>This method only checks for basic compliance with the formatting rules. Further format
 * checking will be done in {@link #deserialize()}.</p>
 * @static
 * @param {String} strToCheck The string to be checked
 * @return {Boolean} True if the specified string contains the definition of a polygonal
 *         area
 */
CQ.form.HotspotImageMap.RectArea.isStringRepresentation = function(strToCheck) {
    var strLen = strToCheck.length;
    if (strLen < 13) {
        return false;
    }
    var contentStartPos = strToCheck.indexOf("(");
    if (contentStartPos <= 0) {
        return false;
    }
    var prefix = strToCheck.substring(0, contentStartPos);
    if (prefix != "rect") {
        return false;
    }
    if (!strToCheck.charAt(strLen) == ')') {
        return false;
    }
    return true;
};

/**
 * <p>Parses the specified string representation and creates a suitable
 * {@link CQ.form.HotspotImageMap.RectArea} object accordingly.</p>
 * <p>The String representation should have been checked beforehand using
 * {@link #isStringRepresentation}.</p>
 * @static
 * @param {String} stringDefinition the String representation of the rectangular area (as
 *        created by {@link #serialize})
 * @return {CQ.form.HotspotImageMap.RectArea} The rectangular area created; null, if the
 *         string definition is not correct
 */
CQ.form.HotspotImageMap.RectArea.deserialize = function(stringDefinition) {
    var defStartPos = stringDefinition.indexOf("(");
    if (defStartPos < 0) {
        return null;
    }
    var defEndPos = stringDefinition.indexOf(")", defStartPos + 1);
    if (defEndPos < 0) {
        return null;
    }
    var def = stringDefinition.substring(defStartPos + 1, defEndPos);
    var coordIndex;
    var coords = def.split(",");
    if (coords.length != 4) {
        return null;
    }
    var preparsedCoords = new Array();
    var coordCnt = coords.length;
    for (coordIndex = 0; coordIndex < coordCnt; coordIndex++) {
        var coord = parseInt(coords[coordIndex]);
        if (isNaN(coord)) {
            return null;
        }
        preparsedCoords[coordIndex] = coord;
    }
    return new CQ.form.HotspotImageMap.RectArea({ },
            preparsedCoords[1], preparsedCoords[0], preparsedCoords[3], preparsedCoords[2]);
};

/*
 * Copyright 1997-2011 Day Management AG
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
 * @author syee@crownpartners.com
 * @class CQ.form.HotspotImageMap.CircularArea
 * @extends CQ.form.HotspotImageMap.Area
 * @private
 * This class represents a circular area of the image map.
 * @constructor
 * <p>Creates a new ImageMap.CircularArea.</p>
 * <p>The center point of the circle must already be defined.</p>
 * @param {Object} config The config object
 * @param {Number} x horizontal coordinate of center point
 * @param {Number} y vertical coordinate of center point
 * @param {Number} radius initial radius of circle; use 1 for a new circle
 */
CQ.form.HotspotImageMap.CircularArea = CQ.Ext.extend(CQ.form.HotspotImageMap.Area, {

    constructor: function(config, x, y, radius) {
        CQ.form.HotspotImageMap.RectArea.superclass.constructor.call(this,
                CQ.form.ImageMap.AREATYPE_CIRCLE, config);
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.handlePosition = {
            "x": x + radius,
            "y": y
        };
    },

    /**
     * Checks if the specified coordinates "belong" to the image area.
     * @param {Object} coords Coordinates to check; properties: x, y
     * @param {Number} tolerance The tolerance distance to be considered
     * @return {Boolean} True if the specified coordinates "belong" to the image area
     */
    isTouched: function(coords, tolerance) {
        var handleId = this.calculateHandleId(coords);
        if (handleId != null) {
            return true;
        }
        coords = coords.unzoomedUnclipped;
        var distance = CQ.form.ImageMap.Helpers.calculateDistanceToCircle(this, coords);
        return (distance <= tolerance);
    },

    /**
     * Calulates a suitable dragging reference.
     */
    calculateDraggingReference: function() {
        if (this.pointToMove == null) {
            this.draggingReference = {
                "x": this.x,
                "y": this.y
            };
        } else  {
            this.draggingReference = {
                "x": this.pointToMove.x,
                "y": this.pointToMove.y
            };
        }
    },

    /**
     * Moves the shape or the point by the specified offsets.
     * @param {Number} xOffs The horizontal offset
     * @param {Number} yOffs The vertical offset
     * @param {Object} coords Coordinates; properties: x, y
     * @return {Boolean} True if the shape has to be redrawn
     */
    moveShapeBy: function(xOffs, yOffs, coords) {
        var imgSize = coords.unzoomed.rotatedImageSize;
        var destCoords =
                this.calculateDestCoords(xOffs, yOffs, this.draggingReference, imgSize);
        if (this.pointToMove == null) {
            var handleDeltaX = this.handlePosition.x - this.x;
            var handleDeltaY = this.handlePosition.y - this.y;
            this.x = destCoords.x;
            this.y = destCoords.y;
            if (this.x < this.radius) {
                this.x = this.radius;
            }
            if (this.y < this.radius) {
                this.y = this.radius;
            }
            if (this.x >= (imgSize.width - this.radius)) {
                this.x = imgSize.width - this.radius - 1;
            }
            if (this.y >= (imgSize.height - this.radius)) {
                this.y = imgSize.height - this.radius - 1;
            }
            this.handlePosition.x = this.x + handleDeltaX;
            this.handlePosition.y = this.y + handleDeltaY;
        } else {
            this.pointToMove.x = destCoords.x;
            this.pointToMove.y = destCoords.y;
            var xDelta = this.pointToMove.x - this.x;
            var yDelta = this.pointToMove.y - this.y;
            this.radius = Math.sqrt((xDelta * xDelta) + (yDelta * yDelta));
            var angle = null;
            if (xDelta != 0) {
                angle = Math.atan(yDelta / xDelta);
            }
            var isCorrected = false;
            if ((this.x - this.radius) < 0) {
                this.radius = this.x;
                isCorrected = true;
            }
            if ((this.x + this.radius) >= imgSize.width) {
                this.radius = imgSize.width - this.x - 1;
                isCorrected = true;
            }
            if ((this.y - this.radius) < 0) {
                this.radius = this.y;
                isCorrected = true;
            }
            if ((this.y + this.radius) >= imgSize.height) {
                this.radius = imgSize.height - this.y - 1;
                isCorrected = true;
            }
            if (isCorrected) {
                if (angle != null) {
                    var correctX = this.radius * Math.cos(angle);
                    var correctY = this.radius * Math.sin(angle);
                    if (xDelta < 0) {
                        correctX = -correctX;
                        correctY = -correctY;
                    }
                    this.pointToMove.x = this.x + correctX;
                    this.pointToMove.y = this.y + correctY;
                } else {
                    this.pointToMove.x = this.x;
                    if (yDelta < 0) {
                        this.pointToMove.y = this.y - this.radius;
                    } else {
                        this.pointToMove.y = this.y + this.radius;
                    }
                }
            }
        }
        return true;
    },

    /**
     * Calculates a "handle id" for the specified coordinates.
     * @param {Object} coords Coordinates; properties: x, y
     * @return {Object} A suitable handle ID for correct highlightning
     */
    calculateHandleId: function(coords) {
        if (this.isPartOfHandle(this.handlePosition.x, this.handlePosition.y, coords)) {
            return this.handlePosition;
        }
        return null;
    },

    /**
     * Checks if the area is correct (width and height are &lt; 0).
     * @return {Boolean} True if the area is correct
     */
    isValid: function() {
        return (this.radius > 0);
    },

    /**
     * <p>Rotates the area by the specified angle.</p>
     * <p>Currently, only multiples of 90 (degrees) are supported.</p>
     * @param {Number} angle The angle (degrees; clockwise) the area has to be rotated by
     * @param {Number} absAngle The absolute angle (degrees) the area has to be rotated to
     * @param {Object} imageSize The size of the image (original, unrotated); properties:
     *        width, height
     */
    rotateBy: function(angle, absAngle, imageSize) {
        // calculate basic angle
        var basicAngle = this.calcBasicAngle(angle, absAngle);
        var margin = ((basicAngle == 90) || (basicAngle == 270)
                ? imageSize.width : imageSize.height);
        // rotate in 90 degree steps
        var steps = Math.round(angle / 90);
        var tempX;
        for (var step = 0; step < steps; step++) {
            tempX = this.x;
            this.x = margin - this.y;
            this.y = tempX;
            tempX = this.handlePosition.x;
            this.handlePosition.x = margin - this.handlePosition.y;
            this.handlePosition.y = tempX;
        }
    },

    /**
     * Sets the correct handle for dragging the circle after adding it.
     * @param {Object} coords Coordinates; properties: x, y
     */
    onAddForDrag: function(coords) {
        this.handleId = this.handlePosition;
    },

    /**
     * Draws the circular area.
     * @param {CanvasRenderingContext2D} ctx The canvas context to be used for drawing
     * @param {Number} zoom Real zoom factor (1.0 means that the original size should be
     *        used)
     * @param {Object} offsets Drawing offsets; properties: srcX, srcY, destX, destY,
     *        imageSize, zoomedSize (see {@link CQ.form.SmartImage.Shape#draw})
     */
    draw: function(ctx, zoom, offsets) {
        CQ.Log.debug("CQ.form.HotspotImageMap.CircularArea#paint: Started.");
        var coords = this.calculateDisplayCoords(zoom, offsets, this.x, this.y);
        var displayRadius = this.calculateDisplaySize(zoom, this.radius, 0).width;
        // fill
        if (this.fillColor) {
            ctx.fillStyle = this.fillColor;
            ctx.beginPath();
            ctx.arc(coords.x, coords.y, displayRadius, 0, 2 * Math.PI, false);
            ctx.closePath();
            ctx.fill();
        }
        // stroke
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = this.getColor();
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, displayRadius, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.stroke();
        // handle
        var drawHandle = (this.isRollOver);
        if (drawHandle) {
            var isHandleSelected = (this.handleId != null);
            var handleCoords =
                    this.calculateDisplayCoords(zoom, offsets, this.handlePosition);
            this.drawHandle(
                    handleCoords.x, handleCoords.y, isHandleSelected, false, ctx);
        }
        CQ.Log.debug("CQ.form.HotspotImageMap.CircularArea#paint: Finished.");
    },

    /**
     * Creates a text representation of the area.
     * @return {String} The text representation of the area
     */
    serialize: function() {
        return "circle(" + this.x + "," + this.y + "," + Math.round(this.radius) + ")"
                + this.destination.serialize();
    },

    /**
     * Creates a String representation of the area's coordinates (may be edited by user).
     * @return {String} The String representation of the area's coordinates
     */
    toCoordString: function() {
        return "(" + this.x + "/" + this.y + ") r:" + Math.round(this.radius);
    },

    /**
     * <p>Sets the circular area according to the specified coordinate String
     * representation.</p>
     * <p>The area must be repainted to reflect the changes visually.</p>
     * @param {String} coordStr The string representing the coordinates
     * @return {Boolean} True if the area could be adapted to the string; false if the
     *         string could not be parsed
     */
    fromCoordString: function(coordStr) {
        var coordDef = CQ.form.ImageMap.Helpers.parseCoordinateString(coordStr);
        if (coordDef == null) {
            return false;
        }
        var coords = coordDef.coordinates;
        if ((coords.length != 2) || (coordDef.coordinatesPairCnt != 1)) {
            return false;
        }
        var radius, x, y;
        if (coords[0].radius) {
            radius = coords[0].radius;
            x = coords[1].x;
            y = coords[1].y;
        } else {
            radius = coords[1].radius;
            x = coords[0].x;
            y = coords[0].y;
        }
        // todo implement more validation code?
        var newX, newY;
        var deltaX = this.handlePosition.x - this.x;
        var deltaY = this.handlePosition.y - this.y;
        if (deltaX != 0) {
            var angle = Math.atan(deltaY / deltaX);
            newX = Math.cos(angle) * radius;
            newY = Math.sin(angle) * radius;
            if (deltaX < 0) {
                newX = -newX;
                newY = -newY;
            }
            this.handlePosition.x = newX + x;
            this.handlePosition.y = newY + y;
        } else {
            this.handlePosition.x = x;
            newY = (this.handlePosition.y < this.y ? -radius : radius);
            this.handlePosition.y = newY + y;
        }
        this.x = x;
        this.y = y;
        this.radius = radius;
        return true;
    }

});

/**
 * <p>Checks if the specified string contains the definition of a circular area.</p>
 * <p>This method only checks for basic compliance with the formatting rules. Further format
 * checking will be done in {@link #deserialize}.</p>
 * @static
 * @param {String} strToCheck The string to check
 * @return {Boolean} True if the specified string contains the definition of a circular
 *         area
 */
CQ.form.HotspotImageMap.CircularArea.isStringRepresentation = function(strToCheck) {
    var strLen = strToCheck.length;
    if (strLen < 13) {
        return false;
    }
    var contentStartPos = strToCheck.indexOf("(");
    if (contentStartPos <= 0) {
        return false;
    }
    var prefix = strToCheck.substring(0, contentStartPos);
    if (prefix != "circle") {
        return false;
    }
    if (!strToCheck.charAt(strLen) == ')') {
        return false;
    }
    return true;
};

/**
 * <p>Parses the specified string representation and creates a suitable
 * {@link CQ.form.HotspotImageMap.CircularArea} object accordingly.</p>
 * <p>The specified string representation should have been checked beforehand using
 * {@link #isStringRepresentation}.</p>
 * @static
 * @param {String} stringDefinition The String representation of the polygonal area (as
 *        created by {@link #serialize})
 * @return {CQ.form.HotspotImageMap.CircularArea} The image map created; null, if the string
 *         definition is not correct
 */
CQ.form.HotspotImageMap.CircularArea.deserialize = function(stringDefinition) {
    var defStartPos = stringDefinition.indexOf("(");
    if (defStartPos < 0) {
        return null;
    }
    var defEndPos = stringDefinition.indexOf(")", defStartPos + 1);
    if (defEndPos < 0) {
        return null;
    }
    var def = stringDefinition.substring(defStartPos + 1, defEndPos);
    var coordIndex;
    var coords = def.split(",");
    if (coords.length != 3) {
        return null;
    }
    var preparsedCoords = new Array();
    var coordCnt = coords.length;
    for (coordIndex = 0; coordIndex < coordCnt; coordIndex++) {
        var coord = parseInt(coords[coordIndex]);
        if (isNaN(coord)) {
            return null;
        }
        preparsedCoords[coordIndex] = coord;
    }
    return new CQ.form.HotspotImageMap.CircularArea({ },
            preparsedCoords[0], preparsedCoords[1], preparsedCoords[2]);
};

/*
 * Copyright 1997-2011 Day Management AG
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
 * @author syee@crownpartners.com
 * @class CQ.form.HotspotImageMap.PolyArea
 * @extends CQ.form.HotspotImageMap.Area
 * @private
 * This class represents a polygonal area of the image map.
 * @constructor
 * Creates a new ImageMap.PolyArea.
 * @param {Object} config The config object
 * @param {Number} x1 horizontal coordinate of first polygon point
 * @param {Number} y1 vertical coordinate of first polygon point
 */
CQ.form.HotspotImageMap.PolyArea = CQ.Ext.extend(CQ.form.HotspotImageMap.Area, {

    constructor: function(config, x1, y1) {
        CQ.form.HotspotImageMap.RectArea.superclass.constructor.call(this,
                CQ.form.ImageMap.AREATYPE_POLYGON, config);
        this.areaType = CQ.form.ImageMap.AREATYPE_POLYGON;
        this.destination = new CQ.form.HotspotImageMap.AreaDestination();
        this.points = new Array();
        this.points.push({
            "x": x1,
            "y": y1
        });
    },

    /**
     * Adds a new point to the polygon.
     * @param {Number} x The horizontal coordinate of point to add
     * @param {Number} y The vertical coordinate of point to add
     * @return {Object} The object representing the newly created point; properties: x, y
     */
    addPoint: function(x, y) {
        var thePoint = {
            "x": x,
            "y": y
        };
        this.points.push(thePoint);
        return thePoint;
    },

    /**
     * <p>Inserts a new point on an existing line of the polygon.</p>
     * <p>The method determines the correct insertion point, using the specified tolerance
     * distance. If the specified point is not near an existing line, the method will
     * return null.</p>
     * @param {Number} x The horizontal coordinate of the point to insert
     * @param {Number} y The vertical coordinate of the point to insert
     * @param {Number} tolerance The tolerance distance
     * @return {Object} The object representing the newly created point; null if wrong
     *         coordinates were specified
     */
    insertPoint: function(x, y, tolerance) {
        var pointToAdd = {
            "x": x,
            "y": y
        };
        var pointCnt = this.points.length;
        var insertIndex = this.calculatePointInsertIndex(x, y, tolerance);
        if (insertIndex < 0) {
            return null;
        }
        if (insertIndex < pointCnt) {
            for (var copyIndex = pointCnt; copyIndex > insertIndex; copyIndex--) {
                this.points[copyIndex] = this.points[copyIndex - 1];
            }
        }
        this.points[insertIndex] = pointToAdd;
        return pointToAdd;
    },

    /**
     * <p>Removes the specified point from the polygon.</p>
     * <p>The point to remove is determined by object identity first, then by comparing
     * coordinates.</p>
     * <p>A redraw must be issued explicitly to actually remove the point from screen.
     * </p>
     * @param {Object} pointToRemove The point to be removed (properties: x, y)
     */
    removePoint: function(pointToRemove) {
        var pointCnt = this.points.length;
        var isRemoved = false;
        var checkIndex, pointToCheck;
        for (checkIndex = 0; checkIndex < pointCnt; checkIndex++) {
            pointToCheck = this.points[checkIndex];
            if (pointToCheck == pointToRemove) {
                this.points[checkIndex] = null;
                if (this.handleId == pointToCheck) {
                    this.handleId = null;
                }
                if (this.selectedHandle == pointToCheck) {
                    this.selectedHandle = null;
                }
                isRemoved = true;
                break;
            }
        }
        if (!isRemoved) {
            for (checkIndex = 0; checkIndex < pointCnt; checkIndex++) {
                pointToCheck = this.points[checkIndex];
                if ((pointToCheck.x == pointToRemove.x)
                        && (pointToCheck.y == pointToRemove.y)) {
                    this.points[checkIndex] = null;
                    if (this.handleId == pointToCheck) {
                        this.handleId = null;
                    }
                    if (this.selectedHandle == pointToCheck) {
                        this.selectedHandle = null;
                    }
                    break;
                }
            }
        }
        CQ.form.ImageMap.Helpers.compactArray(this.points);
    },

    /**
     * Checks if the specified coordinates are "on" a line between two specified points.
     * @param {Object} coordsToCheck Coordinates to check; properties: x, y
     * @param {Object} lineStart Line's start position; properties: x, y
     * @param {Object} lineEnd Line's end position; properties: x, y
     * @param {Number} tolerance The tolerance distance
     * @return {Boolean} True if the specified coordinate is on (or nearby) the specified
     *         line
     */
    isOnLine: function(coordsToCheck, lineStart, lineEnd, tolerance) {
        var distance = CQ.form.ImageMap.Helpers.calculateDistance(
                lineStart, lineEnd, coordsToCheck);
        return (distance <= tolerance);
    },

    /**
     * Calculates a "bounding rectangle" for the polygonal area.
     * @return {Object} Object with properties top, left, bottom and right; null if no
     *         points are defined (should not happen, as the polygon area would be invalid
     *         then and hence automatically removed)
     */
    calcBoundingRect: function() {
        if (this.points.length == 0) {
            return null;
        }
        var minX = this.points[0].x;
        var minY = this.points[0].y;
        var maxX = minX;
        var maxY = minY;
        var pointCnt = this.points.length;
        for (var pointIndex = 0; pointIndex < pointCnt; pointIndex++) {
            var pointToCheck = this.points[pointIndex];
            if (pointToCheck.x < minX) {
                minX = pointToCheck.x;
            } else if (pointToCheck.x > maxX) {
                maxX = pointToCheck.x;
            }
            if (pointToCheck.y < minY) {
                minY = pointToCheck.y;
            } else if (pointToCheck.y > maxY) {
                maxY = pointToCheck.y;
            }
        }
        var boundingRect = new Object();
        boundingRect.top = minY;
        boundingRect.left = minX;
        boundingRect.bottom = maxY;
        boundingRect.right = maxX;
        return boundingRect;
    },

    /**
     * <p>Calculates the insert index for the specified coordinates.</p>
     * <p>This is used to determine where a new polygon point must be inserted in the list
     * of existing polygon points.</p>
     * @param {Number} x horizontal coordinate
     * @param {Number} y vertical coordinate
     * @return {Number} The array index where the point has to be inserted; -1 if the
     *         coordinates are invalid
     */
    calculatePointInsertIndex: function(x, y, tolerance) {
        var pointCnt = this.points.length;
        if (pointCnt == 1) {
            return 1;
        }
        var coordsToCheck = new Object();
        coordsToCheck.x = x;
        coordsToCheck.y = y;
        for (var pointIndex = 1; pointIndex < pointCnt; pointIndex++) {
            var p1 = this.points[pointIndex - 1];
            var p2 = this.points[pointIndex];
            if (this.isOnLine(coordsToCheck, p1, p2, tolerance)) {
                return pointIndex;
            }
        }
        var isOnLine = this.isOnLine(coordsToCheck,
                this.points[0], this.points[pointCnt - 1], tolerance);
        if (isOnLine) {
            return pointCnt;
        }
        return -1;
    },

    /**
     * Cleans up the polygon by removing succeeding points using the same coordinates.
     */
    cleanUp: function() {
        var pointCnt = this.points.length;
        for (var pointIndex = 0; pointIndex < (pointCnt - 1); pointIndex++) {
            var p1 = this.points[pointIndex];
            var p2 = this.points[pointIndex + 1];
            if ((p1.x == p2.x) && (p1.y == p2.y)) {
                this.points[pointIndex] = null;
                CQ.Log.info("CQ.form.HotspotImageMap.PolyArea#cleanUp: Polygon point with identical coordinates removed: " + p1.x + "/" + p1.y);
            }
        }
        CQ.form.ImageMap.Helpers.compactArray(this.points);
    },

    /**
     * <p>Checks if the specified coordinates "belong" to the image area.</p>
     * <p>Currently, the borders of the polygonal area are checked for this.</p>
     * @param {Object} coords Coordinates to check; properties: x, y
     * @param {Number} tolerance The tolerance distance to be considered
     * @return {Boolean} True if the specified coordinates "belong" to the image area
     */
    isTouched: function(coords, tolerance) {
        var handleId = this.calculateHandleId(coords);
        if (handleId != null) {
            return true;
        }
        var pointCnt = this.points.length;
        coords = coords.unzoomedUnclipped;
        // handle "one point polygons"
        if (pointCnt == 1) {
            var xDelta = Math.abs(this.points[0].x - coords.x);
            var yDelta = Math.abs(this.points[0].y - coords.y);
            return (xDelta < tolerance) && (yDelta < tolerance);
        } else {
            var isOnLine;
            for (var pointIndex = 1; pointIndex < pointCnt; pointIndex++) {
                var p1 = this.points[pointIndex - 1];
                var p2 = this.points[pointIndex];
                isOnLine = this.isOnLine(coords, p1, p2, tolerance);
                if (isOnLine) {
                    return true;
                }
            }
            return this.isOnLine(
                    coords, this.points[0], this.points[pointCnt - 1], tolerance);
        }
    },

    /**
     * Calulates a suitable dragging reference
     */
    calculateDraggingReference: function() {
        if (this.pointToMove == null) {
            var boundingRect = this.calcBoundingRect();
            this.draggingReference = {
                "x": boundingRect.left,
                "y": boundingRect.top,
                "width": boundingRect.right - boundingRect.left + 1,
                "height": boundingRect.bottom - boundingRect.top + 1
            };
        } else  {
            this.draggingReference = {
                "x": this.pointToMove.x,
                "y": this.pointToMove.y
            };
        }
    },

    /**
     * Moves the whole polygonal area by the specified offset.
     * @param {Number} xOffs The horizontal move offset
     * @param {Number} yOffs The vertical move offset
     * @param {Object} coords Coordinates (properties: x, y)
     */
    moveShapeBy: function(xOffs, yOffs, coords) {
        var imgSize = coords.unzoomed.rotatedImageSize;
        var destCoords =
                this.calculateDestCoords(xOffs, yOffs, this.draggingReference, imgSize);
        var destX = destCoords.x;
        var destY = destCoords.y;
        if (this.pointToMove == null) {
            var endX = destX + this.draggingReference.width;
            if (endX >= imgSize.width) {
                destX = imgSize.width - this.draggingReference.width;
            }
            var endY = destY + this.draggingReference.height;
            if (endY >= imgSize.height) {
                destY = imgSize.height - this.draggingReference.height;
            }
            var currentBounds = this.calcBoundingRect();
            var pointOffsX = destX - currentBounds.left;
            var pointOffsY = destY - currentBounds.top;
            var pointCnt = this.points.length;
            for (var pointIndex = 0; pointIndex < pointCnt; pointIndex++) {
                var pointToMove = this.points[pointIndex];
                pointToMove.x += pointOffsX;
                pointToMove.y += pointOffsY;
            }
        } else {
            this.pointToMove.x = destX;
            this.pointToMove.y = destY;
        }
        return true;
    },

    /**
     * Calculates a "handle id" for the specified coordinates.
     * @param {Number} x The horizontal position to check
     * @param {Number} y The vertical position to check
     * @return {String} A suitable handle ID for correct highlightning
     */
    calculateHandleId: function(x, y) {
        var pointCnt = this.points.length;
        for (var pointIndex = 0; pointIndex < pointCnt; pointIndex++) {
            var pointToCheck = this.points[pointIndex];
            if (this.isPartOfHandle(pointToCheck.x, pointToCheck.y, x, y)) {
                return pointToCheck;
            }
        }
        return null;
    },

    /**
     * Handles unSelect events for polygonal areas.
     */
    onUnSelect: function() {
        this.selectedHandle = null;
        CQ.form.HotspotImageMap.PolyArea.superclass.onUnSelect.call(this);
        return true;
    },

    /**
     * Checks if the area is correct (at least one point is defined).
     * @return {Boolean} True if the area is correct
     */
    isValid: function() {
        return (this.points.length > 0);
    },

    /**
     * <p>Rotates the area by the specified angle.</p>
     * <p>Currently, only multiples of 90 (degrees) are supported.</p>
     * @param {Number} angle The angle (degrees; clockwise) the area has to be rotated by
     * @param {Number} absAngle The absolute angle (degrees) the area has to be rotated to
     * @param {Object} imageSize The size of the image (original, unrotated); properties:
     *                 width, height
     */
    rotateBy: function(angle, absAngle, imageSize) {
        // calculate basic angle
        var basicAngle = this.calcBasicAngle(angle, absAngle);
        var margin = ((basicAngle == 90) || (basicAngle == 270)
                ? imageSize.width : imageSize.height);
        // rotate in 90 degree steps
        var steps = Math.round(angle / 90);
        var tempX;
        for (var step = 0; step < steps; step++) {
            var pointCnt = this.points.length;
            for (var pointIndex = 0; pointIndex < pointCnt; pointIndex++) {
                var pointToRotate = this.points[pointIndex];
                tempX = pointToRotate.x;
                pointToRotate.x = margin - pointToRotate.y;
                pointToRotate.y = tempX;
            }
        }
    },

    /**
     * Sets the correct handle for dragging the initial polygon point after adding it.
     * @param {Object} coords Coordinates
     */
    onAddForDrag: function(coords) {
        this.handleId = this.points[0];
    },

    /**
     * Handles the start of a dragging operation for polygonal areas.
     */
    onDragStart: function() {
        this.selectedHandle = this.handleId;
        CQ.form.HotspotImageMap.PolyArea.superclass.onDragStart.call(this);
        return true;
    },

    /**
     * Selects a polygon point by its index.
     * @param {Number} index The index of the polygon point to select; if an invalid index
     *        is specified, the current selection is removed
     */
    selectPointAt: function(index) {
        if ((index >= 0) && (index < this.points.length)) {
            this.selectedHandle = this.points[index];
        } else {
            this.selectedHandle = null;
        }
    },

    /**
     * Selects the specified polygon point.
     * @param {Object} point The polygon point to select; properties: x, y
     */
    selectPoint: function(point) {
        if (point == null) {
            this.selectedHandle = null;
        } else {
            var pointCnt = this.points.length;
            for (var pointIndex = 0; pointIndex < pointCnt; pointIndex++) {
                var pointToCheck = this.points[pointIndex];
                if ((pointToCheck.x == point.x) && (pointToCheck.y == point.y)) {
                    this.selectedHandle = pointToCheck;
                    return;
                }
            }
        }
    },

    /**
     * Draws the polygonal area.
     * @param {CanvasRenderingContext2D} ctx The canvas context to be used for drawing
     * @param {Number} zoom Real zoom factor (1.0 means that the original size should be
     *        used)
     * @param {Object} offsets Drawing offsets; properties: srcX, srcY, destX, destY,
     *        imageSize, zoomedSize (see {@link CQ.form.SmartImage.Shape#draw})
     */
    draw: function(ctx, zoom, offsets) {
        CQ.Log.debug("CQ.form.HotspotImageMap.PolyArea#paint: Started.");
        // draw polygon
        var pointIndex, pointToProcess;
        var pointCnt = this.points.length;
        var origin = this.calculateDisplayCoords(zoom, offsets, this.points[0]);
        if (this.fillColor) {
            ctx.fillStyle = this.fillColor;
            ctx.beginPath();
            // fill
            ctx.moveTo(origin.x, origin.y);
            for (pointIndex = 0; pointIndex < pointCnt; pointIndex++) {
                pointToProcess =
                        this.calculateDisplayCoords(zoom, offsets, this.points[pointIndex]);
                ctx.lineTo(pointToProcess.x, pointToProcess.y);
            }
            ctx.closePath();
            ctx.fill();
        }
        // stroke
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = this.getColor();
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        for (pointIndex = 1; pointIndex < pointCnt; pointIndex++) {
            pointToProcess =
                    this.calculateDisplayCoords(zoom, offsets, this.points[pointIndex]);
            ctx.lineTo(pointToProcess.x, pointToProcess.y);
        }
        ctx.closePath();
        ctx.stroke();
        // handles
        var drawHandle =
            this.isRollOver || (this.selectedHandle != null) || this.isSelected;
        var isOriginSelected = (this.selectedHandle == this.points[0]);
        var isOriginRolledOver = (this.handleId == this.points[0]);
        if (drawHandle || isOriginSelected) {
            this.drawHandle(origin.x, origin.y, isOriginRolledOver, isOriginSelected, ctx);
        }
        for (pointIndex = 1; pointIndex < pointCnt; pointIndex++) {
            pointToProcess =
                    this.calculateDisplayCoords(zoom, offsets, this.points[pointIndex]);
            var isSelected = (this.selectedHandle == this.points[pointIndex]);
            var isRolledOver = (this.handleId == this.points[pointIndex]);
            if (drawHandle || isSelected) {
                this.drawHandle(
                        pointToProcess.x, pointToProcess.y, isRolledOver, isSelected, ctx);
            }
        }
        CQ.Log.debug("CQ.form.ImageMap.PolyArea#paint: Finished.");
    },

    /**
     * Creates a String representation of the area.
     * @return {String} The String representation of the area
     */
    serialize: function() {
        var dump = "poly(";
        var pointCnt = this.points.length;
        for (var pointIndex = 0; pointIndex < pointCnt; pointIndex++) {
            if (pointIndex > 0) {
                dump += ",";
            }
            var pointToDump = this.points[pointIndex];
            dump += pointToDump.x + "," + pointToDump.y;
        }
        dump += ")";
        dump += this.destination.serialize();
        return dump;
    },

    /**
     * Creates a String representation of the area's coordinates (may be edited by user).
     * @return {String} String representation of the area's coordinates
     */
    toCoordString: function() {
        var coordStr = "";
        var pointCnt = this.points.length;
        for (var pointIndex = 0; pointIndex < pointCnt; pointIndex++) {
            if (pointIndex > 0) {
                coordStr += " ";
            }
            var pointToAdd = this.points[pointIndex];
            coordStr += "(" + pointToAdd.x + "/" + pointToAdd.y + ")";
        }
        return coordStr;
    },

    /**
     * <p>Sets the polygon points according to the specified coordinate String
     * representation.<p>
     * <p>The area must be repainted to reflect the changes visually.</p>
     * @param {String} coordStr coordinates The String representation
     * @return {Boolean} True if the area could be adapted to the string; false if the
     *         string could not be parsed
     */
    fromCoordString: function(coordStr) {
        var coordDef = CQ.form.ImageMap.Helpers.parseCoordinateString(coordStr);
        if (coordDef == null) {
            return false;
        }
        var coords = coordDef.coordinates;
        if ((coords.length < 2) || (coordDef.coordinatesPairCnt != coords.length)) {
            return false;
        }
        // todo implement validation code?
        this.points.length = 0;
        var pointCnt = coords.length;
        for (var pointIndex = 0; pointIndex < pointCnt; pointIndex++) {
            var pointCoord = coords[pointIndex];
            this.addPoint(pointCoord.x, pointCoord.y);
        }
        return true;
    }

});

/**
 * <p>Checks if the specified string contains the definition of a polygonal area.</p>
 * <p>This method only checks for basic compliance with the formatting rules. Further format
 * checking will be done in {@link #deserialize}.</p>
 * @static
 * @param {String} strToCheck The string to check
 * @return {Boolean} True if the specified string contains the definition of a polygonal
 *         area
 */
CQ.form.HotspotImageMap.PolyArea.isStringRepresentation = function(strToCheck) {
    var strLen = strToCheck.length;
    if (strLen < 9) {
        return false;
    }
    var contentStartPos = strToCheck.indexOf("(");
    if (contentStartPos <= 0) {
        return false;
    }
    var prefix = strToCheck.substring(0, contentStartPos);
    if (prefix != "poly") {
        return false;
    }
    if (!strToCheck.charAt(strLen) == ')') {
        return false;
    }
    return true;
};

/**
 * <p>Parses the specified String representation and creates a suitable
 * {@link CQ.form.HotspotImageMap.PolyArea} object accordingly.</p>
 * <p>The specified String representation should have been checked beforehand using
 * {@link #isStringRepresentation}.</p>
 * @static
 * @param {String} stringDefinition The String representation of the polygonal area (as
 *        created by {@link #serialize})
 * @return {CQ.form.HotspotImageMap.PolyArea} The polygonal area created; null, if the
 *         string definition is not correct
 */
CQ.form.HotspotImageMap.PolyArea.deserialize = function(stringDefinition) {
    var defStartPos = stringDefinition.indexOf("(");
    if (defStartPos < 0) {
        return null;
    }
    var defEndPos = stringDefinition.indexOf(")", defStartPos + 1);
    if (defEndPos < 0) {
        return null;
    }
    var def = stringDefinition.substring(defStartPos + 1, defEndPos);
    var pointDefs = def.split(",");
    var preparsedPoints = new Array();
    var pointIndex;
    var pointCnt = pointDefs.length;
    if ((pointCnt & 1) != 0) {
        return null;
    }
    for (pointIndex = 0; pointIndex < pointCnt; pointIndex += 2) {
        var x = parseInt(pointDefs[pointIndex]);
        var y = parseInt(pointDefs[pointIndex + 1]);
        if (isNaN(x)) {
            return null;
        }
        if (isNaN(y)) {
            return null;
        }
        preparsedPoints[pointIndex / 2] = { "x": x, "y": y };
    }
    pointCnt = preparsedPoints.length;
    var theArea = new CQ.form.HotspotImageMap.PolyArea({ },
            preparsedPoints[0].x, preparsedPoints[0].y);
    for (pointIndex = 1; pointIndex < pointCnt; pointIndex++) {
        theArea.addPoint(preparsedPoints[pointIndex].x, preparsedPoints[pointIndex].y);
    }
    return theArea;
};

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
 * @author syee@crownpartners.com
 * @class CQ.form.GmdsLinkDialog
 * @extends CQ.Ext.form.ComboBox
 * This widget is a Dialog that contains the GMDS standard link fieldset. This was built
 * for the mm_hotspot_1 component's.
 * @constructor
 * Creates a new PathField.
 * @param {Object} config The config object
 */
CQ.form.GmdsLinkDialog = CQ.Ext.extend(CQ.Ext.form.ComboBox, {
    /**
     * @cfg {String} rootPath
     * The root path where completion and browsing starts. Use the empty string
     * for the repository root (defaults to '/content').
     */
    
    /**
     * @cfg {String} suffix
     * The suffix to append to the selected path, defaults to "".
     */

    /**
     * @cfg {String} rootTitle
     * Custom title for the root path.<br/><br/>
     *
     * <p>Defaults to the value of {@link #rootPath}; if that is not set, it will be
     * 'Websites' (localized), to match the default value of '/content' for the
     * {@link #rootPath}.</p>
     */

    /**
     * @cfg {String/String[]} predicate
     * The predicate(s) to pass to the server when listing resources. Use empty
     * string to browse the full Sling resource tree. Example predicates
     * are 'hierarchy', 'folder', 'hierarchyNotFile', 'nosystem' and 'siteadmin'.
     * If you want multiple predicates, pass them as array of strings.<br/><br/>
     *
     * <p>Defaults to 'siteadmin', for browsing the pages that are visible in the siteadmin.</p>
     */
    
    /**
     * @cfg {Boolean} showTitlesInTree
     * Whether to show the (jcr:)titles as names of the tree nodes or the
     * plain jcr node name (defaults to true).
     */

    /**
     * @cfg {Boolean} hideTrigger
     * True to disable the option to open the browse dialog (this config is
     * inherited from {@link CQ.Ext.form.TriggerField}). Defaults to false.
     */
    
    /**
     * @cfg {Boolean} parBrowse
     * True to allow paragraph browsing and section in a grid next to the
     * tree panel in the browse dialog. If this is enabled, it is recommended
     * to use a predicate like 'hierarchy' to have pages as leaf nodes in the tree.
     * Defaults to false.
     */
    
    /**
     * @cfg {String} linkPattern
     * A pattern to format links after selection in the browse dialog (using
     * {@link CQ.Util#patchText}). This is used when only a tree item is selected
     * (which is always the case if {@link #parBrowse} = false). It has only one
     * argument '{0}', which is the path from the tree. See also
     * {@link #parLinkPattern}.<br/><br/>
     *
     * <p>Defaults to '{0}.html' if {@link #parBrowse} = true, otherwise simply '{0}'.</p>
     */

    /**
     * @cfg {String} parLinkPattern
     * A pattern to format links after selection of a paragraph in the browse
     * dialog (using {@link CQ.Util#patchText}). This only applies when
     * {@link #parBrowse} = true. It has two arguments,
     * the first '{0}' is the path from the tree, the second '{1}'
     * is the paragraph. See also {@link #linkPattern}.<br/><br/>
     *
     * <p>Defaults to '{0}.html#{1}'.</p>
     */

    /**
     * @cfg {Number} searchDelay
     * The time in ms to delay the search event after the user has stopped typing.
     * This prevents the field from firing the search event after each key input.
     * Use 0 to not fire the search event at all (defaults to 200).
     */

   /**
     * @cfg {Object} treeLoader
     * The config options for the tree loader in the browse dialog.
     * See {@link CQ.Ext.tree.TreeLoader} for possible options.<br/><br/>
     * 
     * <p>Defaults to '/bin/tree/ext.json' for the dataUrl and uses 'predicate' as
     * baseParam.predicate; also note that the treeLoader's createNode and getParams
     * functions are overwritten.</p>
     */

    /**
     * @cfg {Object} browseDialogCfg
     * The config for the {@link CQ.BrowseDialog}.
     * @since 5.4
     */

    /**
     * @cfg {Object} treeRoot
     * The config options for the tree root node in the browse dialog.
     * See {@link CQ.Ext.tree.TreeNode} for possible options.<br/><br/>
     *
     * <p>Defaults to {@link #rootPath} for the name and {@link #rootTitle} for the text of the root.</p>
     */

    /**
     * The panel holding the link dialog.
     * @type CQ.BrowseDialog
     * @private
     */
    dialog: null,

    /**
     * The trigger action of the TriggerField, creates a new link Dialog
     * if it has not been created before, and shows it.
     * @private
     */
    onTriggerClick : function() {
        this.dialog.show();
        this.dialog.el.setZIndex(12000);
    },
    
    /**
     * This method gets called when the trigger has been fired when
     * there is nothing in the coordinates field. This method should do absolutely
     * nothing. It simply overrides the ComboBox's findRecord so it won't throw
     * an error message. 
     * 
     * @private
     */
    findRecord: function() {
    	var record;
    	return record;
    },

    constructor : function(config){
        var pagePath = CQ.WCM.getPagePath().replace("/cf#", "");
        var dialogConfig = {
            "title" : "HREF",
            "width" : 500,
            "height" : 600, 
            "xtype" : "dialog",
            "modal" : true,
            "buttons" : CQ.Dialog.OKCANCEL,
            "gmdsLinkDialog" : this,
            "ok" : function() {
            	this.gmdsLinkDialog.setLinkDialogValue();
            	this.hide();
            },
            "items" : {
            	"itemId" : "linkpanel",
            	"xtype" : "panel",
            	"items" : {
            		"xtype" : "fieldset",
            		"itemId" : "linkfieldset",
            		"title" : "Link",
            		"items" : [{
            			"fieldLabel" : "Link Title",
            			"fieldDescription" : "Enter an alternative link title here to add information about the nature of a link. Link titles will be shown in a tool tip. Please note: Do not put pipes in the link title.",
            			"itemId" : "x-link-title-item",
                        "name" : "./linkTitle",
                        "width" : 278,
                        "xtype" : "textfield"
            		}, {
            			"fieldLabel" : "Internal Link",
            			"name" : "./internalLink",
            			"itemId" : "x-internal-link-item",
            			"xtype" : "browsefield",
            			"width" : 278,
            			"listeners" : {
            				"change" : {
            					"fn" : function(field, value) {
            						gmdsGetDeepLinkOpts().setNewDeepLinkParam(field, value); 
            						gmdsGetParameterizedLinkOpts().setInternalLink(value); 
            						gmdsInPageOpts().setLinks(field, value); 
            					}
            				},
            	            "dialogselect" : {
            	            	"fn" : function(field) { 
            	            		gmdsGetDeepLinkOpts().setNewDeepLinkParam(field.browseField, field.browseField.getValue()); 
            	            		gmdsGetParameterizedLinkOpts().setInternalLink(field.browseField.getValue()); 
            	            		gmdsInPageOpts().setLinks(field.browseField, field.browseField.getValue()); 
            	            	}
            	            }
            			}
            		}, {
            			"fieldLabel" : "Deep-link Target",
            			"fieldDescription" : "Some Pages provide targets for deep-linking to tabs, sections, or flash chapters.",
            			"allowEmpty" : true,
            			"itemId" : "x-deeplink-param-item",
            			"name" : "./deeplinkParam",
            			"options" : [{
                        	text : '- No deeplink targets available -',
                        	value : ''
            			}],
            			"type" : "select",
            			"xtype" : "selection"
            		}, {
            			"fieldLabel" : "In-page Link",
            			"itemId" : "x-in-page-link-item",
            			"name" : "./inPageLink",
            			"options" : [{
            				text : '- No in page links available -',
                    		value : ''
            			}],
            			"type" : "select",
            			"xtype" : "selection"
            		}, {
            			"fieldLabel" : "Disclaimer Link",
            			"itemId" : "x-disclaimer-link-item",
            			"fieldDescription" : "Choose a page, bodystyle, or general disclaimer to present as an in-page layer.",
            			"name" : "./disclaimer",
            			"options" :  pagePath +".all-disclaimers.json", 
            			"type" : "select",
            			"xtype" : "selection"
            		}, {
            			"fieldLabel" : "Glossary Link",
            			"itemId" : "x-glossary-link-item",
            			"fieldDescription" : "Choose a Glossary Item, that should be presented as an in-page layer.",
            			"name" : "./glossaryLink",
            			"options" : pagePath + ".all-glossary-items.json", 
            			"type" : "select",
            			"xtype" : "selection"
            		
            		}, {
            			"fieldLabel" : "External Link",
            			"fieldDescription" : "External links can only be inserted from the External Link Library.",
            			"itemId" : "x-external-link-item",
            			"name" : "./externalLink",
            			"width" : 278,
            			"xtype" : "browsefield"
            		}, {
            			"fieldLabel" : "Link Parameters",
            			"fieldDescription" : "Choose a link parameter by clicking on \'+\'. If you have chosen a \'request parameter without fixed value\', you can type the value in the textfield after the \'=\'.",
            			"name" : "./link_params",
            			"itemId" : "x-link-params-item",
            			"xtype" : "extendedmultifield",
            			"itemDialog" : "/apps/gmds/components/core/dialog/snippets/parameterizedlinkparams.infinity.json",
            	        "itemDialogNameProperty" : "parameterized", 
            	        "orderable" : false,
            			"fieldConfig" : {
            				"xtype" : "textfield",
            				"orderable" : false
            			},
            			"listeners" : {
            				"afterlayout" : {
            					"fn" : function() {
            						 gmdsGetParameterizedLinkOpts().getInternalLink(this); 
            					}
            				}
            			}
            		}]
            	}
            }
        };
        // build the dialog and load its contents
        this.dialog = new CQ.Dialog(dialogConfig);
        var linkFieldset = this.dialog.items.get("linkpanel").items.get("linkfieldset").items;
        // actually sets the options. could not do optionsProvider or optionsCallback because you can't
        // access the dialog before it has been loaded
        linkFieldset.get("x-deeplink-param-item").setOptions( gmdsGetDeepLinkOpts().getDeepLinkParam(linkFieldset.get("x-internal-link-item")));
        linkFieldset.get("x-in-page-link-item").setOptions( gmdsInPageOpts().getLinks(linkFieldset.get("x-internal-link-item")));
        CQ.form.GmdsLinkDialog.superclass.constructor.call(this, config);
    },
    
    initComponent : function(){
        CQ.form.GmdsLinkDialog.superclass.initComponent.call(this);
    },
    
    /* This value will be shown in the parent dialog after closing this widget. (GMDSST-50842) */
    setLinkDialogValue : function() {
    	if (this.dialog.find("itemId", "x-internal-link-item")[0].getValue() !== "") {
    		this.setValue(this.dialog.find("itemId", "x-internal-link-item")[0].getValue());
    	} else {
    		this.setValue(this.dialog.find("itemId", "x-external-link-item")[0].getValue());
    	}
    }
    
    /* Not used for mm_hotspot_1, but can be used for the future. This code may be changed.
    // overriding CQ.form.CompositeField#setValue
	setValue: function(value) {
    	var linkfieldset = this.dialog.items.get("linkpanel").items.get("linkfieldset").items;
    	var array = value.split("@@");
    	linkfieldset.get("x-link-title-item").setValue(array[0]);
    	linkfieldset.get("x-internal-link-item").setValue(array[1]);
    	linkfieldset.get("x-deeplink-param-item").setValue(array[2]);
    	linkfieldset.get("x-in-page-link-item").setValue(array[3]);
    	linkfieldset.get("x-disclaimer-link-item").setValue(array[4]);
    	linkfieldset.get("x-glossary-link-item").setValue(array[5]);
    	linkfieldset.get("x-external-link-item").setValue(array[6]);
    	linkfieldset.get("x-link-params-item").setValue(array[7]); 
    },

    // overriding CQ.form.CompositeField#getValue
    getValue: function() {
    	return this.getRawValue();
    },

    // overriding CQ.form.CompositeField#getRawValue
    getRawValue: function() {
    	var linkfieldset = this.dialog.items.get("linkpanel").items.get("linkfieldset").items;
    	var value = linkfieldset.get("x-link-title-item").getValue() + "@@" + linkfieldset.get("x-internal-link-item").getValue() + "@@" + linkfieldset.get("x-deeplink-param-item").getValue() + "@@" + linkfieldset.get("x-in-page-link-item").getValue() + "@@" + linkfieldset.get("x-disclaimer-link-item").getValue() + "@@" + linkfieldset.get("x-glossary-link-item").getValue() + "@@" + linkfieldset.get("x-external-link-item").getValue() + "@@" + linkfieldset.get("x-link-params-item").getValue();
    	return value;
    } */
});

CQ.Ext.reg("gmdslinkdialog", CQ.form.GmdsLinkDialog);

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
 * @author syee@crownpartners.com
 * @class CQ.form.GmdsHotspotMultiField
 * @extends CQ.form.CompositeField
 * The HotspotMultifield is an editable list of form fields for editing
 * HotspotItem properties. The difference from this version of a multifield
 * and the OOTB version is that this one has a listener attached to the +
 * button. This was built specifically for mm_hotspot_1's advanced tab. 
 * @constructor
 * Creates a new HotspotMultiField.
 * @param {Object} config The config object
 */
CQ.form.GmdsHotspotMultiField = CQ.Ext.extend(CQ.form.CompositeField, {

    /**
     * @cfg {Boolean} orderable
     * If the list of fields should be orderable and Up/Down buttons
     * are rendered (defaults to true).
     */
    
    /**
     * @cfg {CQ.Ext.form.Field/CQ.form.CompositeField} fieldConfig
     * The configuration options for the fields. Defaults to
     * <pre><code>
{
     "xtype": "textfield"
}      </code></pre>
     */
    fieldConfig: null,

    /**
     * @cfg {String} typeHint
     * The type of the single fields, such as "String" or "Boolean". If set to "String",
     * for example, the @TypeHint will automatically be set to "String[]" to ensure that
     * a multi-value property is created. Not set by default.
     * @since 5.4
     */
    
    // private
    path: "",

    // private
    bodyPadding: 4,

    // the width of the field
    // private
    fieldWidth: 0,

    constructor: function(config) {
        var list = this;

        if (typeof config.orderable === "undefined") {
            config.orderable = true;
        }
        
        if (!config.fieldConfig) {
            config.fieldConfig = {};
        }
        if (!config.fieldConfig.xtype) {
            config.fieldConfig.xtype = "textfield";
        }
        config.fieldConfig.name = config.name;
//        config.fieldConfig.style = "width:95%;";
        config.fieldConfig.orderable = config.orderable;

        var items = new Array();

        if(config.readOnly) {
            //if component is defined as readOnly, apply this to all items
            config.fieldConfig.readOnly = true;
        } else {
            items.push({
                "xtype":"button",
                "cls": "cq-multifield-btn",
                "text":"+",
                "handler":function() {
                    list.addItem();
                }
            });
        }

        this.hiddenDeleteField = new CQ.Ext.form.Hidden({
            "name":config.name + CQ.Sling.DELETE_SUFFIX
        });
        items.push(this.hiddenDeleteField);

        if (config.typeHint) {
            this.typeHintField = new CQ.Ext.form.Hidden({
                name: config.name + CQ.Sling.TYPEHINT_SUFFIX,
                value: config.typeHint + "[]"
            });
            items.push(this.typeHintField);
        }
        
        config = CQ.Util.applyDefaults(config, {
            "defaults":{
                "xtype":"gmdshotspotmultifielditem",
                "fieldConfig":config.fieldConfig
            },
            "items":[
                {
                    "xtype":"panel",
                    "border":false,
                    "bodyStyle":"padding:" + this.bodyPadding + "px",
                    "items":items
                }
            ]
        });
        CQ.form.GmdsHotspotMultiField.superclass.constructor.call(this,config);
        if (this.defaults.fieldConfig.regex) {
            // somehow regex get broken in this.defaults, so fix it
            this.defaults.fieldConfig.regex = config.fieldConfig.regex;
        }
        this.addEvents(
            /**
             * @event change
             * Fires when the value is changed.
             * @param {CQ.form.MultiField} this
             * @param {Mixed} newValue The new value
             * @param {Mixed} oldValue The original value
             */
            "change"
        );
    },

    initComponent: function() {
        CQ.form.GmdsHotspotMultiField.superclass.initComponent.call(this);

        this.on("resize", function() {
            // resize fields
            var item = this.items.get(0);
            this.calculateFieldWidth(item);
            if (this.fieldWidth > 0) {
                for (var i = 0; i < this.items.length; i++) {
                    try {
                        this.items.get(i).field.setWidth(this.fieldWidth);
                    }
                    catch (e) {
                        CQ.Log.debug("CQ.form.MultiField#initComponent: " + e.message);
                    }
                }
            }
        });

        this.on("disable", function() {
            this.hiddenDeleteField.disable();
            if (this.typeHintField) this.typeHintField.disable();
            this.items.each(function(item/*, index, length*/) {
                if (item instanceof CQ.form.GmdsHotspotMultiField.Item) {
                    item.field.disable();
                }
            }, this);
        });

        this.on("enable", function() {
            this.hiddenDeleteField.enable();
            if (this.typeHintField) this.typeHintField.enable();
            this.items.each(function(item/*, index, length*/) {
                if (item instanceof CQ.form.GmdsHotspotMultiField.Item) {
                    item.field.enable();
                }
            }, this);
        });
    },

    // private
    calculateFieldWidth: function(item) {
        try {
            this.fieldWidth = this.getSize().width - 2*this.bodyPadding; // total row width
            for (var i = 1; i < item.items.length; i++) {
                // subtract each button
                var w = item.items.get(i).getSize().width;
                if (w == 0) {
                    // button has no size, e.g. because MV is hidden >> reset fieldWidth to avoid setWidth
                    this.fieldWidth = 0;
                    return;
                }

                this.fieldWidth -= item.items.get(i).getSize().width;
            }
        }
        catch (e) {
            // initial resize fails if the MF is on the visible first tab
            // >> reset to 0 to avoid setWidth
            this.fieldWidth = 0;
        }
    },

    /**
     * Adds a new field with the specified value to the list.
     * @param {String} value The value of the field
     */
    addItem: function(value) {
        var item = this.insert(this.items.getCount() - 1, {});
        this.findParentByType("form").getForm().add(item.field);
        this.doLayout();
        
    	var h = gmdsDOMHelper();
        var parent = h.getParentNode(this, 'tabpanel');
        if(this.findParentByType("tabpanel").items.get('x-advanced-tab-panel').items.get('x-global-hotspot-checkbox').getValue()[0] === 'true') {
			h.setVisibleByClass('x-panel-hotspot-image', parent, false);
		} else {
			h.setVisibleByClass('x-panel-hotspot-image', parent, true); 
        }
        this.doLayout();
        
        if (item.field.processPath) item.field.processPath(this.path);
        if (value) {
            item.setValue(value);
        }

        if (this.fieldWidth < 0) {
            // fieldWidth is < 0 when e.g. the MultiField is on a hidden tab page;
            // do not set width but wait for resize event triggered when the tab page is shown
            return;
        }
        if (!this.fieldWidth) {
            this.calculateFieldWidth(item);
        }
        try {
            item.field.setWidth(this.fieldWidth);
        }
        catch (e) {
            CQ.Log.debug("CQ.form.MultiField#addItem: " + e.message);
        }
    },

    processPath: function(path) {
        this.path = path;
    },

    // overriding CQ.form.CompositeField#getValue
    getValue: function() {
        var value = new Array();
        this.items.each(function(item, index/*, length*/) {
            if (item instanceof CQ.form.GmdsHotspotMultiField.Item) {
                value[index] = item.getValue();
                index++;
            }
        }, this);
        return value;
    },

    // overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
        this.fireEvent("change", this, value, this.getValue());
        var oldItems = this.items;
        oldItems.each(function(item/*, index, length*/) {
            if (item instanceof CQ.form.GmdsHotspotMultiField.Item) {
                this.remove(item, true);
                this.findParentByType("form").getForm().remove(item);
            }
        }, this);
        this.doLayout();
        if ((value != null) && (value != "")) {
            if (value instanceof Array || CQ.Ext.isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    this.addItem(value[i]);
                }
            } else {
                this.addItem(value);
            }
        }
    }

});

CQ.Ext.reg("gmdshotspotmultifield", CQ.form.GmdsHotspotMultiField);

/**
 * @private
 * @class CQ.form.MultiField.Item
 * @extends CQ.Ext.Panel
 * The MultiField.Item is an item in the {@link CQ.form.MultiField}.
 * This class is not intended for direct use.
 * @constructor
 * Creates a new MultiField.Item.
 * @param {Object} config The config object
 */
CQ.form.GmdsHotspotMultiField.Item = CQ.Ext.extend(CQ.Ext.Panel, {

    constructor: function(config) {
        var item = this;
        var fieldConfig = CQ.Util.copyObject(config.fieldConfig);
        this.field = CQ.Util.build(fieldConfig, true);

        var items = new Array();
        items.push({
            "xtype":"panel",
            "border":false,
            "cellCls":"cq-multifield-itemct",
//            "width": 100,
            "items":item.field
        });

        if(!fieldConfig.readOnly) {
            if (fieldConfig.orderable) {
                items.push({
                    "xtype": "panel",
                    "border": false,
                    "items": {
                        "xtype": "button",
                        "text": CQ.I18n.getMessage("Up", null, "Ordering upwards in MultiField"),
                        "handler": function(){
                            var parent = item.ownerCt;
                            var index = parent.items.indexOf(item);
                            
                            if (index > 0) {
                                item.reorder(parent.items.itemAt(index - 1));
                            }
                        }
                    }
                });
                items.push({
                    "xtype": "panel",
                    "border": false,
                    "items": {
                        "xtype": "button",
                        "text": CQ.I18n.getMessage("Down", null, "Ordering downwards in MultiField"),
                        "handler": function(){
                            var parent = item.ownerCt;
                            var index = parent.items.indexOf(item);
                            
                            if (index < parent.items.getCount() - 1) {
                                item.reorder(parent.items.itemAt(index + 1));
                            }
                        }
                    }
                });
            }
            items.push({
                "xtype":"panel",
                "border":false,
                "items":{
                    "xtype":"button",
                    "cls": "cq-multifield-btn",
                    "text":"-",
                    "handler":function() {
                        item.ownerCt.remove(item);
                    }
                }
            });
        }

        config = CQ.Util.applyDefaults(config, {
            "layout":"table",
            "anchor":"100%",
            "border":false,
            "layoutConfig":{
                "columns":4
            },
            "defaults":{
                "bodyStyle":"padding:3px"
            },
            "items":items
        });
        CQ.form.GmdsHotspotMultiField.Item.superclass.constructor.call(this, config);

        if (config.value) {
            this.field.setValue(config.value);
        }
    },

//    initComponent: function() {
//        CQ.form.MultiField.Item.superclass.initComponent.call(this);
////        this.on("show", function() {console.log("show");});
////        this.on("render", function() {console.log("render");});
////        this.on("activate", function() {console.log("activate");});
////        this.on("add", function() {console.log("add");});
//
////        this.on("resize", function(p,w) {console.log("resize::",w);});
////        this.on("bodyresize", function(p,w) {console.log("bodyresize::",w);});
//
//        this.on("resize", function() {
//            var pfs = this.findByType(CQ.form.PathField);
//            for (var i = 0; i < pfs.length; i++) {
//                console.log("^^",pfs[i]);
//                pfs[i].updateEditState();
//            }
//            //            console.log("resize::",w);
//        });
//
//    },

    /**
     * Reorders the item above the specified item.
     * @param item {CQ.form.MultiField.Item} The item to reorder above
     * @member CQ.form.MultiField.Item
     */
    reorder: function(item) {
        var value = item.field.getValue();
        item.field.setValue(this.field.getValue());
        this.field.setValue(value);
    },

    /**
     * Returns the data value.
     * @return {String} value The field value
     * @member CQ.form.MultiField.Item
     */
    getValue: function() {
        return this.field.getValue();
    },

    /**
     * Sets a data value into the field and validates it.
     * @param {String} value The value to set
     * @member CQ.form.MultiField.Item
     */
    setValue: function(value) {
        this.field.setValue(value);
    }
});

CQ.Ext.reg("gmdshotspotmultifielditem", CQ.form.GmdsHotspotMultiField.Item);

/**
 * @author syee@crownpartners.com
 * @class HotspotItem
 * @extends CQ.form.CompositeField
 * This is a widget for the GmdsHotspotMultifield Widget.
 * @constructor
 * Creates a new HotspotItem
 * @param {Object} config The config object
 */
CQ.form.GmdsHotspotItem = CQ.Ext.extend(CQ.form.CompositeField, {

	hiddenField: null,
	
    xvalue: null,
    
    yvalue: null,
    
    captionText: null,
    
    xcaptionAlign: null,
    
    ycaptionAlign: null,
    
    internalLink: null, 
    
    deepLinkParam: null,
    
    inPageLink: null,
    
    glossaryLink: null,
    
    disclaimerLink: null,
    
    externalLink: null,
    
    linkParams: null,
    
    hotspotImg: null,
    
    hotspotHoverImg: null,

    constructor: function(config) {
        config = config || { };
        var defaults = {
	        "border": false,
	        columns:1,
	        "stateful": false,
	        "items" : [{
	        	"xtype": "panel",
	        	"bodyBorder" : false,
	        	"cls" : "cnt-positioning-base",
	        	"layout" : "table",
	        	"layoutConfig" : {
	        		"columns" : 2
	        	},
	        	"items" : [{
	        		"itemId" : "columnone",
	        		"bodyBorder" : false,
	        		"cellCls" : "column-1",
	        		"layout" : "column",
	        		"title" : "Horizontal point (X-value) in pixels",
	        		"xtype" : "panel",
	        		"items" : [{
	        			"itemId" : "xfirst",
	        			"bodyBorder" : false,
	        			"columnWidth" : 0.3,
	        			"xtype": "panel",
	        			"items" : {
	        				"itemId" : "xarrows",
	        				"cls" : "arrows-horizontal",
	        				"html" : "&#8592; &#8594;",
	        				"text" : "",
	        				"xtype" : "static"
	        			}
	        		}, {
	        			"itemId" : "xsecond",
	        			"bodyBorder" : false,
	        			"columnWidth" : 0.7,
	        			"xtype" : "panel",
	        			"items" : [{
	        				"itemId" : "xspinner",
	        				"value" : 0,
	        				"regexText" : "Only digits allowed",
	        				"width" : 50,
	        				"xtype" : "spinner",
	        				"strategy" : {
	        					"alternateIncrementValue" : 1,
	        					"incrementValue" : 1,
	        					"xtype" : "number"
	        				}
	        			}, {
	        				"itemId" : "xspinnerdesc",
	        				"text" : "Use the arrows -OR- provide a number",
	        				"xtype" : "static"
	        			}]
	        		}]
	        	}, {
	        		"itemId" : "columntwo",
	        		"bodyBorder" : false,
	        		"cellCls" : "column-2",
	        		"layout" : "column",
	        		"title" : "Vertical point (y-value) in pixels",
	        		"xtype" : "panel",
	        		"items" : [{
	        			"itemId" : "yfirst",
	        			"bodyBorder" : false,
	        			"columnWidth" : 0.3,
	        			"xtype" : "panel",
	        			"items" : {
	        				"itemId" : "yarrows",
	        				"cls" : "arrows-vertical",
	        				"html" : "&#8593; &#8595;",
	        				"text" : "",
	        				"xtype" : "static"
	        			}
	        		}, {
	        			"itemId" : "ysecond",
	        			"bodyBorder" : false,
	        			"columnWidth" : 0.7,
	        			"xtype" : "panel",
	        			"items" : [{
	        				"itemId" : "yspinner",
	        				"value" : 0,
	        				"width" : 50,
	        				"xtype" : "spinner",
	        				"strategy" : {
	        					"incrementValue" : 1,
	        					"alternateIncrementValue" : 1,
	        					"xtype" : "number"
	        				}
	        			}, {
	        				"itemId" : "yspinnerdesc",
	        				"text" : "Use the arrows -OR- provide a number",
	        				"xtype" : "static"
	        			}]
	        		}]
	        	}]
	        }, {
	        	"xtype" : "textarea",
	        	"fieldLabel" : "Caption Text",
	        	"height" : 80,
	        	"anchor" : "94.8%",
	        	"itemId" : "caption",
	        	"labelStyle" : "display:block; width: 130px;"
	        }, {
	        	"itemId" : "captionalign",
	        	"bodyBorder" : false,
	        	"fieldLabel" : "Caption Alignment",
	        	"labelStyle" : "display:block; width: 130px;",
	        	"layout" : "column",
	        	"xtype" : "panel",
	        	"items" : [{
	        		"bodyBorder" : false,
	        		"columnWidth" : 0.15,
	        		"xtype" : "panel",
	        		"items" : {
	        			"style" : "textAlign:center;paddingTop:2px;",
						"text" : "x-Value",
						"xtype" : "static"
	        		}
	        	}, {
	        		"itemId" : "xcaptionalignpanel",
	        		"bodyBorder" : false,
	        		"columnWidth" : 0.35,
	        		"xtype" : "panel",
	        		"items" : {
	        			"itemId" : "xcaptionalign",
						"type" : "select",
						"value" : "right",
						"xtype" : "selection",
						"options" : [{
							"text" : "Right",
							"value" : "right"
						}, {
							"text" : "Center",
							"value" : "center"
						}, {
							"text" : "Left",
							"value" : "left"
						}]
	        		}
	        	}, {
	        		"bodyBorder" : false,
	        		"columnWidth" : 0.15,
	        		"xtype" : "panel",
	        		"items" : {
	        			"style" : "textAlign:center;paddingTop:2px;",
						"text" : "y-Value",
						"xtype" : "static"
	        		}
	        	}, {
	        		"itemId" : "ycaptionalignpanel",
	        		"bodyBorder" : false,
	        		"columnWidth" : 0.35,
	        		"xtype" : "panel",
	        		"items" : {
	        			"itemId" : "ycaptionalign",
						"type" : "select",
						"value" : "bottom",
						"xtype" : "selection",
						"options" : [{
							"text" : "Bottom",
							"value" : "bottom"
						}, {
							"text" : "Center",
							"value" : "center"
						}, {
							"text" : "Top",
							"value" : "top"
						}]
	        		}
	        	}]
	        }, {
	        	"itemId" : "linkpath",
	        	"xtype" : "gmdslinkdialog",
	        	"editable": false,
	        	"labelStyle" : "display:block; width: 130px;",
	        	"fieldLabel" : "Hotspot Link",
	        	"anchor" : "94.8%"
	        }, {
	        	"itemId" : "hotspotimagepanel",
	        	"xtype:" : "panel",
	        	"bodyBorder" : false,
	        	"cls" : "x-panel-hotspot-image",
	        	"layout" : "form",
	        	"items" : [{
    	        	"itemId" : "defaultimage",
    	        	"xtype" : "pathfield",
    	        	"rootPath" : "/content/dam",
    	        	"fieldLabel" : "Hotspot Default Image",
    	        	"labelStyle" : "display:block; width: 130px;",
    	        	"anchor" : "94.8%"
	    	    }, {
    	        	"itemId" : "hoverimage",
    	        	"xtype" : "pathfield",
    	        	"rootPath" : "/content/dam",
    	        	"fieldLabel" : "Hotspot On Image",
    	        	"labelStyle" : "display:block; width: 130px;",
    	        	"anchor" : "94.8%"
    	        }]
	        }, {
	        	"html" : "<hr>",
	        	"xtype" : "static"
	        }]
        };
        config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.GmdsHotspotItem.superclass.constructor.call(this, config);
    },

    // overriding CQ.Ext.Component#initComponent
    initComponent: function() {
    	CQ.form.GmdsHotspotItem.superclass.initComponent.call(this);
        this.hiddenField = new CQ.Ext.form.Hidden({
            name: this.name,
            "stateful": false
        });
        this.add(this.hiddenField);
        
        this.xvalue = this.items.items[0].items.get("columnone").items.get("xsecond").items.get("xspinner");
        this.yvalue = this.items.items[0].items.get("columntwo").items.get("ysecond").items.get("yspinner");
        this.captionText = this.items.get("caption");
        this.xcaptionAlign = this.items.get("captionalign").items.get("xcaptionalignpanel").items.get("xcaptionalign");
        this.ycaptionAlign = this.items.get("captionalign").items.get("ycaptionalignpanel").items.get("ycaptionalign");
        this.linkTitle = this.items.get("linkpath").dialog.items.get("linkpanel").items.get("linkfieldset").items.get("x-link-title-item");
        this.internalLink = this.items.get("linkpath").dialog.items.get("linkpanel").items.get("linkfieldset").items.get("x-internal-link-item");
        this.deepLinkParam = this.items.get("linkpath").dialog.items.get("linkpanel").items.get("linkfieldset").items.get("x-deeplink-param-item");
        this.inPageLink = this.items.get("linkpath").dialog.items.get("linkpanel").items.get("linkfieldset").items.get("x-in-page-link-item");
        this.disclaimerLink = this.items.get("linkpath").dialog.items.get("linkpanel").items.get("linkfieldset").items.get("x-disclaimer-link-item");
        this.glossaryLink = this.items.get("linkpath").dialog.items.get("linkpanel").items.get("linkfieldset").items.get("x-glossary-link-item");
        this.externalLink = this.items.get("linkpath").dialog.items.get("linkpanel").items.get("linkfieldset").items.get("x-external-link-item");
        this.linkParams = this.items.get("linkpath").dialog.items.get("linkpanel").items.get("linkfieldset").items.get("x-link-params-item");
        this.hotspotImg = this.items.get("hotspotimagepanel").items.get("defaultimage");
        this.hotspotHoverImg = this.items.get("hotspotimagepanel").items.get("hoverimage");
        this.linkPath = this.items.get("linkpath");
    },

    // overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
       var array = value.split("@@");
       this.xvalue.setValue(array[0]);
       this.yvalue.setValue(array[1]);
       this.captionText.setValue(array[2]);
       this.xcaptionAlign.setValue(array[3]);
       this.ycaptionAlign.setValue(array[4]);
       this.linkTitle.setValue(array[5]);
       this.internalLink.setValue(array[6]);
       this.deepLinkParam.setValue(array[7]);
       this.inPageLink.setValue(array[8]);
       this.disclaimerLink.setValue(array[9]);
       this.glossaryLink.setValue(array[10]);
       this.externalLink.setValue(array[11]);
       this.linkParams.setValue(array[12]);
       this.hotspotImg.setValue(array[13]);
       this.hotspotHoverImg.setValue(array[14]);
       // this logic should be the same as setLinkDialogValue in GmdsLinkDialog (GMDSST-50842)
       if (this.internalLink.getValue() !== "") {
           this.linkPath.setValue(this.internalLink.getValue());
       } else {
    	   this.linkPath.setValue(this.externalLink.getValue());
       }
    },

    // overriding CQ.form.CompositeField#getValue
    getValue: function() {
       return this.getRawValue();
    },

    // overriding CQ.form.CompositeField#getRawValue
    getRawValue: function() {
       var value = this.xvalue.getValue() + "@@" + this.yvalue.getValue() + "@@" + (this.captionText.getValue() || "") + "@@" + this.xcaptionAlign.getValue() + "@@" + this.ycaptionAlign.getValue() + "@@" + this.linkTitle.getValue() + "@@" + this.internalLink.getValue() + "@@" + this.deepLinkParam.getValue() + "@@" + this.inPageLink.getValue() + "@@" + this.disclaimerLink.getValue() + "@@" + this.glossaryLink.getValue() + "@@" + this.externalLink.getValue() + "@@" + this.linkParams.getValue() + "@@" + this.hotspotImg.getValue() + "@@" + this.hotspotHoverImg.getValue();
       this.hiddenField.setValue(value);
       return value;
    }
});

// register xtype
CQ.Ext.reg('gmdshotspotitem', CQ.form.GmdsHotspotItem);
/**
 * The <code>HandraiserFormConfigMultiGrid</code> class represents an editable list
 * of form fields for editing multi value properties.
 * 
 * @author horacio.lertora@mrmworldwide.com.ar, hlertora MRM
 * @class CQ.form.HandraiserFormConfigMultiGrid
 * @extends CQ.form.CompositeField
 */
CQ.form.HandraiserFormConfigMultiGrid = CQ.Ext.extend(CQ.form.CompositeField, {

    /**
     * @cfg {Object} fieldConfig
     * The configuration options for the fields (optional).
     */
    fieldConfig: null,
        
    /**
    * @cfg {String} itemStorageNode
    * Defines the crx node name that should be used to store the list entries.
    */       
    itemStorageNode: null,
    
    /**
     * @cfg {String} storeName
     * Name of the remote datastore.
     * Corresponds to the sling.servlet.selectors value of a servlet.
     */       
    storeName: null,
    
    /**
     * @cfg {String} currentCrxPath
     * Current crx path where the dialog data is stored.
     */
    currentCrxPath: null,

    /**
     * @cfg {Object} dialog
     * Dialog that contains the grid widget.
     */
    dialog: null,
    
    /**
     * @cfg {String} grid
     * Grid widget.
     */
    grid: null,
    
    /**
     * @cfg {String} editorType
     * Editor type used for editing grid values.
     * Default is textfield, richtext is supported too.
     */
    editorType: null,
    
    /**
     * @cfg {String} checkBoxPosition
     * Tells whether the checkbox is rendered as first or last cell of a row.
     * Default is first, last is supported too.
     */
    checkBoxPosition: null,
    
    /**
     * @cfg {Boolean} storeName
     * Flag for disabling the display of the move up / move down buttons.
     * Default is false.
     */
    disableMoveButtons: false,
    
    /**
     * @cfg {String} storeName
     * Additional query parameter string that will be sent to the remote store when
     * reading data..
     */
    queryParams: null,
    
    /**
     * @cfg {Boolean} allOptions
     * Flag for enabling an "All Options" checkbox which allows the selection and
     * unselection of all items.
     * Default is false.
     */
    allOptions: false,

    /**
     * @cfg {String} storeName
     * Name of the row id that is assigned to the "All Options" row.
     */
    allOptionsId: '__meta_all__',
    
    
    /**
     * Creates a new <code>CQ.form.GenericSortableMultiGrid</code>.
     * @constructor
     * @param {Object} config The config object
     */
    constructor: function (config) {
        var genericSortableMultiGrid = this;

        this.itemStorageNode = config.name;
        this.storeName = config.storeName;
        this.editorType = config.EditorType;
        this.checkBoxPosition = config.checkBoxPosition;
        this.queryParams = config.queryParams;
        this.disableMoveButtons = this.getBooleanValue(config.disableMoveButtons);
        this.allOptions = this.getBooleanValue(config.allOptions);

        var that = this;
        var items = [];
        
        // create the Grid
        this.grid = new CQ.form.GenericSortableMultiGridPanel({
            viewConfig: {
                forceFit: true
            },
            store: new CQ.Ext.data.Store({widget: that }),
            colModel: new CQ.Ext.grid.ColumnModel({ }),
            height: 350,
            autoHeight: true,
            loadMask: true
        });
        this.grid.allOptions = this.allOptions;
        
        items.push(this.grid); 
        
        config = CQ.Util.applyDefaults(config, {
            "items": items,
            "layout": {
                "type": "fit"
            }
        });
        
        
        CQ.form.GenericSortableMultiGrid.superclass.constructor.call(this, config);
        
        var parentDialog = this.findParentByType('dialog');
        parentDialog.on("beforesubmit", function (e) {
            if (that.grid.activeEditor !== null) {
                that.grid.activeEditor.completeEdit(false);
            }
            that.submitStore(that.grid.store);
        });
        parentDialog.on("hide", function (e) {
            that.grid.activeEditor = null;
        });
    },
    
    // private
    /**
     * Initializes <code>CQ.form.GenericSortableMultiGrid</code>.
     * Registers the event handlers.
     */
    initComponent: function () {
        CQ.form.CompositeField.superclass.initComponent.call(this);
        this.addEvents(CQ.form.Selection.EVENT_SELECTION_CHANGED);
    },            
    
    /**
     * Returns a boolean value for a either a boolean or a String.
     * True is returned if the value is the boolean true or the String "true".
     * 
     * @param boolean or string value
     * @returns true or false
     */
    getBooleanValue: function (value) {
        if (value && (value === true || value === "true")) {
            return true;
        } else {
            return false;
        }
    },
    
    /**
     * Submits the store and posts the grid data back to the store.
     * 
     * @param store store containing data
     */
    submitStore : function (store) {
        var allOptionsChecked = false;
        var json = {rows: []};
        var items = store.data.items;
        for (var i = 0; i < items.length; i++) {
            if (items[i].data.id === '__all__') {
                allOptionsChecked = items[i].data.selected ? true : false;
            } else {
                json.rows.push(items[i].data);
            }
        }
        json.allOptionsChecked = allOptionsChecked;
        var jsonString = CQ.Ext.encode(json);
        
        var storeUrl = this.currentCrxPath + "." + this.storeName + ".json";
        var params = {
            storage_node: this.itemStorageNode, 
            json: jsonString, 
            '_charset_': 'utf-8'
        };
        CQ.HTTP.post(storeUrl, function (options, success, response) {}, params, null, true);
        return true;
    },
    
 
    /**
     * Reads the data from the remote store and reconfigures the grid.
     */
    updateStoreData: function () {
        var that = this;
        if (this.currentCrxPath) {
	        var storeUrl = this.currentCrxPath + "." + this.storeName + ".json?storage_node=" + this.itemStorageNode;
	        if (this.queryParams) {
	            storeUrl += '&' + this.queryParams;
	        }
	        CQ.HTTP.get(storeUrl, function (options, success, response) {
	            if (success) {
	                var data = CQ.HTTP.eval(response);
	          
	                // update column model
	                var columnReader = new CQ.Ext.data.JsonReader({
	                    idProperty: 'id',
	                    root: 'columns',
	                    fields: [
	                        {name: 'title', mapping: 'title'},
	                        {name: 'id', mapping: 'id'},
	                        {name: 'editable', mapping: 'editable'}
	                    ]
	                });
	                var columns = columnReader.readRecords(data).records;
	                var columnArray = new Array(columns.length);
	          
	                var index = 0;
	                
	                columnArray[index] = {id:'id', header: '#', dataIndex: 'id', width: 50, hidden: true};
	                index++;
	          
	                var firstDataRowIndex = index;
	                that.grid.setFirstDataRowIndex(index);
	          
	                for (var i = 0; i < columns.length; i++){
	                    columnArray[index] = {
	                        id: columns[i].get('id'), 
	                        header: columns[i].get('title'), 
	                        dataIndex: columns[i].get('id'),
	                        width: 100,
	                        fixed: false
	                    };
	                    if (columns[i].get('editable')){
	                        columnArray[index].editor = new CQ.Ext.form.TextField();
	                        columnArray[index].css = "border: 1px #cccccc solid;";  
	                    }
	                    if (columns[i].get('editable') && that.editorType == "richtext"){
	                        var richtextConfig = {
	                            rtePlugins: {
	                                edit: {defaultPasteMode : "plaintext", features: [], stripHtmlTags: true},
	                                format: {features: ["bold", "italic"]},
	                                extendedlinks: {features: ["modifylink","unlink"]},
	                                justify: {features: []},
	                                lists: {features: []},
	                                links: {features: []},
	                                subsuperscript: {features: ["superscript"]}
	                            },
	                            height: 100
	                        };
	                        var rte = new CQ.form.RichText(richtextConfig);
	                        columnArray[index].editor = rte;
	                        columnArray[index].css += "height: 100px; padding: 0;";
	                    }
	                    index ++;
	                }

	                columnArray[index] = {id: 'validation'+index, header: 'Validation', dataIndex: 'validation'+index, align: 'center', renderer: that.renderValidationButton, width: 100};
	                index++;
	                
	                if (!that.disableMoveButtons) {
	                    columnArray[index] = {id: 'move', header: 'Move', dataIndex: 'move', align: 'center', renderer: that.renderMoveButton, width: 100};
	                }
	                
	                
	                columnArray.push({id:'disabled', header: '', dataIndex: 'disabled', width: 0, hidden: true});
	                that.grid.colModel.destroy();
	                that.grid.colModel = new CQ.Ext.grid.ColumnModel({
	                    columns: columnArray,
	                    defaults: {
	                        sortable: false,
	                        resizable: false, 
	                        menuDisabled: true,
	                        fixed: true
	                    }
	                });
	          
	                // update store model
	                var fieldArray = new Array(); 
	                fieldArray[0] = "id";
	                index = 1;
	                for (var i = 0; i < columns.length; i++){
	                    fieldArray[index] = columns[i].get('id');
	                    index++;
	                }
	          
	                fieldArray[index] = "selected";
	                if (!that.disableMoveButtons) {
	                    fieldArray[index+1] = {name: "move", defaultvalue: undefined};
	                }
	                fieldArray.push({name: 'disabled', defaultValue: false});
	          
	                that.grid.store.destroy();
	                that.grid.store = new CQ.Ext.data.Store({
	                    reader: new CQ.Ext.data.JsonReader({
	                        idProperty: 'id',
	                        root: 'rows',
	                        fields: fieldArray
	                    }),
	                    widget: that
	                });
	          
	          
	                // load data into the store
	                if (that.allOptions) {
	                    var allOptionsData = {
	                        id: '__all__',
	                        selected: data.allOptionsChecked ? true : false
	                    } 
	                    allOptionsData[columnArray[firstDataRowIndex].id] = CQ.I18n.getMessage('all_options');
	                    data.rows.unshift(allOptionsData);
	                }
	                that.grid.store.loadData(data);
	          
	                // reconfigure grid
	                that.grid.reconfigure(that.grid.store,that.grid.colModel);
	            }
	        });
        }
    },
    
    /**
     * Method that is called if a dialog record is processed.
     * Saves the current crx path and updates the store.
     * 
     * @param record current record
     * @param path current crx path
     */
    processRecord: function (record, path) {
        if( path.substring(path.length - 1) !== '/' && path.substring(path.length - 1) !== '*' ) {
              this.currentCrxPath = path;
              this.updateStoreData();
        }
    },
    
    /**
     * Renders the move up / move down buttons of a grid record.
     * 
     * @param value current record value
     * @param id row id
     * @param r current record
     */
    renderMoveButton: function (value, id, r) {
        var renderContainer = function (value, id, record, mode) {
            var moveMode = mode;
            var currentRecord = record;
            var store = currentRecord.store;
            var minMoveUpIndex = store.widget.allOptions ? 1 : 0;
            var but = new CQ.Ext.Button({
                text: value,
                handler : function (btn, e) {
                    var currentIndex = store.indexOf(currentRecord);
                    if (moveMode == 'UP') {
                        if (currentIndex > minMoveUpIndex) {
                            var item = store.getAt(currentIndex);
                            store.removeAt(currentIndex);
                            store.insert(currentIndex-1,item);
                        }
                    } else {
                        if (currentIndex < currentRecord.store.data.items.length-1) {
                            var item = store.getAt(currentIndex);
                            store.removeAt(currentIndex);
                            store.insert(currentIndex+1,item);
                        }
                    }
                }
            });
        
            but.render(CQ.Ext.getBody(), id);
            
            if (store.widget.grid.activeEditor != null){
                store.widget.grid.activeEditor.completeEdit(false);
            }
            
        };
        var idUp = CQ.Ext.id();
        var idDown = CQ.Ext.id();
        window.setTimeout(function () {renderContainer('up', idUp, r, 'UP');}, 1);
        window.setTimeout(function () {renderContainer('down', idDown, r, 'DOWN');}, 1);
        return('<div style="float:left"><span id="' + idUp + '"></span></div><div style="float:left; margin-left: 5px;"><span id="' + idDown + '"></span></div>');
    },
    
    /**
     * Renders the validation button of a grid record.
     * 
     * @param value current record value
     * @param id row id
     * @param r current record
     */
    renderValidationButton: function (value, id, r) {
    	
        var renderContainer = function (value, id, record, mode) {
        	var DIALOG_PATH = '/apps/gmds/components/config/cnt_handraiser_config_c1/validationDialog.xml';
        	var DIALOG_PROPS = '/jcr:content/cnt_handraiser_config_c1/validations/validation'+record.id;
            var moveMode = mode;
            var currentRecord = record;
            var store = currentRecord.store;
            var minMoveUpIndex = store.widget.allOptions ? 1 : 0;
            var but = new CQ.Ext.Button({
                text: value,
                handler : function (btn, e) {
                    var currentIndex = store.indexOf(currentRecord);
                    var dialogConfig = CQ.WCM.getDialogConfig(DIALOG_PATH);
        			dialogConfig.success = function(form, action){
        				// reload page on dialog success
        				//CQ.Util.reload(CQ.WCM.getContentWindow());
        			};
        			dialogConfig.failure = function(form, action){
        				// alert user when dialog fails
        				var resp = CQ.HTTP.buildPostResponseFromHTML(action.response);
        				CQ.Ext.Msg.alert(response.headers[CQ.HTTP.HEADER_MESSAGE]);
        			};
        			
        			// prepare and show dialog
        			var dialog = CQ.WCM.getDialog(dialogConfig, DIALOG_PATH);
        			dialog.loadContent(CQ.WCM.getPagePath() + DIALOG_PROPS);
        			dialog.setTitle('Validations');
        			dialog.show(); 
                }
            });
        
            but.render(CQ.Ext.getBody(), id);
            
            if (store.widget.grid.activeEditor != null){
                store.widget.grid.activeEditor.completeEdit(false);
            }
            
        };
        var idUp = CQ.Ext.id();
        window.setTimeout(function () {renderContainer('edit', idUp, r, 'UP');}, 1);
        return('<div style="float:left"><span id="' + idUp + '"></span></div>');
    },
    
    /**
     * Resets the store data and rests the grid values.
     * 
     * @param noOfDefaults the default number of records selected
     */
    resetStoreData: function (noOfDefaults) {
        var checkModel = new CQ.Ext.grid.CheckColumn({id:'selected', dataIndex: 'selected', width: 25});
        checkModel.init(this);
        checkModel.resetOptions(0, noOfDefaults);
    }
});

CQ.Ext.reg("handraiserformconfigmultigrid", CQ.form.HandraiserFormConfigMultiGrid);






/**
 * The <code>HandraiserFormConfigMultiGrid</code> class represents an editable list
 * of form fields for editing multi value properties.
 * 
 * @author horacio.lertora@mrmworldwide.com.ar, hlertora MRM
 * @class CQ.form.HandraiserFormConfigMultiGrid
 * @extends CQ.form.CompositeField
 */
CQ.form.HandraiserFormMultiGrid = CQ.Ext.extend(CQ.form.CompositeField, {

    /**
     * @cfg {Object} fieldConfig
     * The configuration options for the fields (optional).
     */
    fieldConfig: null,
        
    /**
    * @cfg {String} itemStorageNode
    * Defines the crx node name that should be used to store the list entries.
    */       
    itemStorageNode: null,
    
    /**
     * @cfg {String} storeName
     * Name of the remote datastore.
     * Corresponds to the sling.servlet.selectors value of a servlet.
     */       
    storeName: null,
    
    /**
     * @cfg {String} currentCrxPath
     * Current crx path where the dialog data is stored.
     */
    currentCrxPath: null,

    /**
     * @cfg {Object} dialog
     * Dialog that contains the grid widget.
     */
    dialog: null,
    
    /**
     * @cfg {String} grid
     * Grid widget.
     */
    grid: null,
    
    /**
     * @cfg {String} editorType
     * Editor type used for editing grid values.
     * Default is textfield, richtext is supported too.
     */
    editorType: null,
    
    /**
     * @cfg {String} checkBoxPosition
     * Tells whether the checkbox is rendered as first or last cell of a row.
     * Default is first, last is supported too.
     */
    checkBoxPosition: null,
    
    /**
     * @cfg {Boolean} storeName
     * Flag for disabling the display of the move up / move down buttons.
     * Default is false.
     */
    disableMoveButtons: false,
    
    /**
     * @cfg {String} storeName
     * Additional query parameter string that will be sent to the remote store when
     * reading data..
     */
    queryParams: null,
    
    /**
     * @cfg {Boolean} allOptions
     * Flag for enabling an "All Options" checkbox which allows the selection and
     * unselection of all items.
     * Default is false.
     */
    allOptions: false,

    /**
     * @cfg {String} storeName
     * Name of the row id that is assigned to the "All Options" row.
     */
    allOptionsId: '__meta_all__',
    
    
    /**
     * Creates a new <code>CQ.form.GenericSortableMultiGrid</code>.
     * @constructor
     * @param {Object} config The config object
     */
    constructor: function (config) {
        var genericSortableMultiGrid = this;

        this.itemStorageNode = config.name;
        this.storeName = config.storeName;
        this.editorType = config.EditorType;
        this.checkBoxPosition = config.checkBoxPosition;
        this.queryParams = config.queryParams;
        this.disableMoveButtons = this.getBooleanValue(config.disableMoveButtons);
        this.allOptions = this.getBooleanValue(config.allOptions);

        var that = this;
        var items = [];
        
        // create the Grid
        this.grid = new CQ.form.GenericSortableMultiGridPanel({
            viewConfig: {
                forceFit: true
            },
            store: new CQ.Ext.data.Store({widget: that }),
            colModel: new CQ.Ext.grid.ColumnModel({ }),
            height: 350,
            autoHeight: true,
            loadMask: true
        });
        this.grid.allOptions = this.allOptions;
        
        items.push(this.grid); 
        
        config = CQ.Util.applyDefaults(config, {
            "items": items,
            "layout": {
                "type": "fit"
            }
        });
        
        
        CQ.form.GenericSortableMultiGrid.superclass.constructor.call(this, config);
        
        var parentDialog = this.findParentByType('dialog');
        parentDialog.on("beforesubmit", function (e) {
            if (that.grid.activeEditor !== null) {
                that.grid.activeEditor.completeEdit(false);
            }
            that.submitStore(that.grid.store);
        });
        parentDialog.on("hide", function (e) {
            that.grid.activeEditor = null;
        });
    },
    
    // private
    /**
     * Initializes <code>CQ.form.GenericSortableMultiGrid</code>.
     * Registers the event handlers.
     */
    initComponent: function () {
        CQ.form.CompositeField.superclass.initComponent.call(this);
        this.addEvents(CQ.form.Selection.EVENT_SELECTION_CHANGED);
    },            
    
    /**
     * Returns a boolean value for a either a boolean or a String.
     * True is returned if the value is the boolean true or the String "true".
     * 
     * @param boolean or string value
     * @returns true or false
     */
    getBooleanValue: function (value) {
        if (value && (value === true || value === "true")) {
            return true;
        } else {
            return false;
        }
    },
    
    /**
     * Submits the store and posts the grid data back to the store.
     * 
     * @param store store containing data
     */
    submitStore : function (store) {
        var allOptionsChecked = false;
        var json = {rows: []};
        var items = store.data.items;
        for (var i = 0; i < items.length; i++) {
            if (items[i].data.id === '__all__') {
                allOptionsChecked = items[i].data.selected ? true : false;
            } else {
                json.rows.push(items[i].data);
            }
        }
        json.allOptionsChecked = allOptionsChecked;
        var jsonString = CQ.Ext.encode(json);
        
        var storeUrl = this.currentCrxPath + "." + this.storeName + ".json";
        var params = {
            storage_node: this.itemStorageNode, 
            json: jsonString, 
            '_charset_': 'utf-8'
        };
        CQ.HTTP.post(storeUrl, function (options, success, response) {}, params, null, true);
        return true;
    },
    
 
    /**
     * Reads the data from the remote store and reconfigures the grid.
     */
    updateStoreData: function () {
        var that = this;
        if (this.currentCrxPath) {
	        var storeUrl = this.currentCrxPath + "." + this.storeName + ".json?storage_node=" + this.itemStorageNode;
	        if (this.queryParams) {
	            storeUrl += '&' + this.queryParams;
	        }
	        CQ.HTTP.get(storeUrl, function (options, success, response) {
	            if (success) {
	                var data = CQ.HTTP.eval(response);
	          
	                // update column model
	                var columnReader = new CQ.Ext.data.JsonReader({
	                    idProperty: 'id',
	                    root: 'columns',
	                    fields: [
	                        {name: 'title', mapping: 'title'},
	                        {name: 'id', mapping: 'id'},
	                        {name: 'editable', mapping: 'editable'}
	                    ]
	                });
	                var columns = columnReader.readRecords(data).records;
	                var columnArray = new Array(columns.length);
	          
	                var index = 0;
	                
	                columnArray[index] = {id:'id', header: '#', dataIndex: 'id', width: 50, hidden: true};
	                index++;
	                
	                var checkModel = new CQ.Ext.grid.CheckColumn({id:'selected', dataIndex: 'selected', width: 25, header: 'Show'});
	                checkModel.init(that);
	                
                    columnArray[index] = checkModel;
                    index++;
	          
	                var firstDataRowIndex = index;
	                that.grid.setFirstDataRowIndex(index);
	          
	                for (var i = 0; i < columns.length; i++){
	                    columnArray[index] = {
	                        id: columns[i].get('id'), 
	                        header: columns[i].get('title'), 
	                        dataIndex: columns[i].get('id'),
	                        width: 100,
	                        fixed: false
	                    };
	                    if (columns[i].get('editable')){
	                        columnArray[index].editor = new CQ.Ext.form.TextField();
	                        columnArray[index].css = "border: 1px #cccccc solid;";  
	                    }
	                    if (columns[i].get('editable') && that.editorType == "richtext"){
	                        var richtextConfig = {
	                            rtePlugins: {
	                                edit: {defaultPasteMode : "plaintext", features: [], stripHtmlTags: true},
	                                format: {features: ["bold", "italic"]},
	                                extendedlinks: {features: ["modifylink","unlink"]},
	                                justify: {features: []},
	                                lists: {features: []},
	                                links: {features: []},
	                                subsuperscript: {features: ["superscript"]}
	                            },
	                            height: 100
	                        };
	                        var rte = new CQ.form.RichText(richtextConfig);
	                        columnArray[index].editor = rte;
	                        columnArray[index].css += "height: 100px; padding: 0;";
	                    }
	                    index ++;
	                }
	                
	                var checkModelRequired = new CQ.Ext.grid.CheckColumn({id:'required', dataIndex: 'required', width: 25, header: 'Required'});
	                checkModelRequired.init(that);
	                
	                columnArray[index++] = checkModelRequired;

	                if (!that.disableMoveButtons) {
	                    columnArray[index] = {id: 'move', header: 'Move', dataIndex: 'move', align: 'center', renderer: that.renderMoveButton, width: 100};
	                }
	                
	                
	                columnArray.push({id:'disabled', header: '', dataIndex: 'disabled', width: 0, hidden: true});
	                that.grid.colModel.destroy();
	                that.grid.colModel = new CQ.Ext.grid.ColumnModel({
	                    columns: columnArray,
	                    defaults: {
	                        sortable: false,
	                        resizable: false, 
	                        menuDisabled: true,
	                        fixed: true
	                    }
	                });
	          
	                // update store model
	                var fieldArray = new Array(); 
	                fieldArray[0] = "id";
	                index = 1;
	                fieldArray[index++] = "selected";
	                for (var i = 0; i < columns.length; i++){
	                    fieldArray[index] = columns[i].get('id');
	                    index++;
	                }
	          
	                
	                fieldArray[index] = "required";
	                if (!that.disableMoveButtons) {
	                    fieldArray[index+1] = {name: "move", defaultvalue: undefined};
	                }
	                fieldArray.push({name: 'disabled', defaultValue: false});
	          
	                that.grid.store.destroy();
	                that.grid.store = new CQ.Ext.data.Store({
	                    reader: new CQ.Ext.data.JsonReader({
	                        idProperty: 'id',
	                        root: 'rows',
	                        fields: fieldArray
	                    }),
	                    widget: that
	                });
	          
	          
	                // load data into the store
	                if (that.allOptions) {
	                    var allOptionsData = {
	                        id: '__all__',
	                        selected: data.allOptionsChecked ? true : false
	                    } 
	                    allOptionsData[columnArray[firstDataRowIndex].id] = CQ.I18n.getMessage('all_options');
	                    data.rows.unshift(allOptionsData);
	                }
	                that.grid.store.loadData(data);
	          
	                // reconfigure grid
	                that.grid.reconfigure(that.grid.store,that.grid.colModel);
	            }
	        });
        }
    },
    
    /**
     * Method that is called if a dialog record is processed.
     * Saves the current crx path and updates the store.
     * 
     * @param record current record
     * @param path current crx path
     */
    processRecord: function (record, path) {
        if( path.substring(path.length - 1) !== '/' && path.substring(path.length - 1) !== '*' ) {
              this.currentCrxPath = path;
              this.updateStoreData();
        }
    },
    
    /**
     * Renders the move up / move down buttons of a grid record.
     * 
     * @param value current record value
     * @param id row id
     * @param r current record
     */
    renderMoveButton: function (value, id, r) {
        var renderContainer = function (value, id, record, mode) {
            var moveMode = mode;
            var currentRecord = record;
            var store = currentRecord.store;
            var minMoveUpIndex = store.widget.allOptions ? 1 : 0;
            var but = new CQ.Ext.Button({
                text: value,
                handler : function (btn, e) {
                    var currentIndex = store.indexOf(currentRecord);
                    if (moveMode == 'UP') {
                        if (currentIndex > minMoveUpIndex) {
                            var item = store.getAt(currentIndex);
                            store.removeAt(currentIndex);
                            store.insert(currentIndex-1,item);
                        }
                    } else {
                        if (currentIndex < currentRecord.store.data.items.length-1) {
                            var item = store.getAt(currentIndex);
                            store.removeAt(currentIndex);
                            store.insert(currentIndex+1,item);
                        }
                    }
                }
            });
        
            but.render(CQ.Ext.getBody(), id);
            
            if (store.widget.grid.activeEditor != null){
                store.widget.grid.activeEditor.completeEdit(false);
            }
            
        };
        var idUp = CQ.Ext.id();
        var idDown = CQ.Ext.id();
        window.setTimeout(function () {renderContainer('up', idUp, r, 'UP');}, 1);
        window.setTimeout(function () {renderContainer('down', idDown, r, 'DOWN');}, 1);
        return('<div style="float:left"><span id="' + idUp + '"></span></div><div style="float:left; margin-left: 5px;"><span id="' + idDown + '"></span></div>');
    },
    
    /**
     * Resets the store data and rests the grid values.
     * 
     * @param noOfDefaults the default number of records selected
     */
    resetStoreData: function (noOfDefaults) {
        var checkModel = new CQ.Ext.grid.CheckColumn({id:'selected', dataIndex: 'selected', width: 25, header: 'Show'});
        checkModel.init(this);
        checkModel.resetOptions(0, noOfDefaults);
        
        var requiredModel = new CQ.Ext.grid.CheckColumn({id:'required', dataIndex: 'required', width: 25, header: 'Required'});
        requiredModel.init(this);
        requiredModel.resetOptions(0, noOfDefaults);
    }
});

CQ.Ext.reg("handraiserformmultigrid", CQ.form.HandraiserFormMultiGrid);



/**
 * @class CQ.form.CustomPathFieldWidget
 * @extends CQ.form.CompositeField
 * This is a custom path field with link text and target
 * @param {Object} config the config object
 */
/**
 * @class Ejst.CustomWidget
 * @extends CQ.form.CompositeField This is a custom widget based on
 *          {@link CQ.form.CompositeField}.
 * @constructor Creates a new CustomWidget.
 * @param {Object}
 *            config The config object
 */
CQ.form.CustomPathFieldWidget = CQ.Ext
		.extend(
				CQ.form.CompositeField,
				{

					/**
					 * @private
					 * @type CQ.Ext.form.TextField
					 */
					hiddenField : null,

					/**
					 * @private
					 * @type CQ.Ext.form.TextField
					 */
					linkText : null,

					/**
					 * @private
					 * @type CQ.Ext.form.PathField
					 */
					internalLink : null,

					/**
					 * @private
					 * @type CQ.Ext.form.PathField
					 */
					externalLink : null,

					/**
					 * @private
					 * @type CQ.Ext.form.FormPanel
					 */
					formPanel : null,

					constructor : function(config) {
						config = config || {};
						var defaults = {
							"border" : true,
							"labelWidth" : 75,
							"layout" : "form"
						// "columns":6
						};
						config = CQ.Util.applyDefaults(config, defaults);
						CQ.form.CustomPathFieldWidget.superclass.constructor
								.call(this, config);
					},

					// overriding CQ.Ext.Component#initComponent
					initComponent : function() {
						CQ.form.CustomPathFieldWidget.superclass.initComponent
								.call(this);

						// Hidden field
						this.hiddenField = new CQ.Ext.form.Hidden({
							name : this.name
						});
						this.add(this.hiddenField);

						// Link text
						this.add(new CQ.Ext.form.Label({
							cls : "customwidget-label",
							text : "Label"
						}));
						this.linkText = new CQ.Ext.form.TextField({
																cls : "customwidget-1",
									fieldLabel : "Label: ",
									allowBlank : false,
									width : 300,
									listeners : {
										change : {
											scope : this,
											fn : this.updateHidden
										}
									}
								});
						this.add(this.linkText);

						// Link URL
						this.add(new CQ.Ext.form.Label({
							cls : "customwidget-label",
							text : "Internal Link"
						}));
						this.internalLink = new CQ.form.PathField({
							cls : "customwidget-2",
							fieldLabel : "Internal Link: ",
							allowBlank : true,
							width : 300,
							listeners : {
								change : {
									scope : this,
									fn : this.updateHidden
								},
								dialogclose : {
									scope : this,
									fn : this.updateHidden
								}
							}
						});
						this.add(this.internalLink);

						// Link externalLink
						// ExternalLink URL
						this.add(new CQ.Ext.form.Label({
							cls : "customwidget-label",
							text : "External Link"
						}));
						this.externalLink = new CQ.form.PathField({
							cls : "customwidget-2",
							fieldLabel : "External Link: ",
							allowBlank : true,
							width : 300,
							listeners : {
								change : {
									scope : this,
									fn : this.updateHidden
								},
								dialogclose : {
									scope : this,
									fn : this.updateHidden
								}
							}
						});
						this.add(this.externalLink);

					},

					processInit : function(path, record) {
						this.linkText.processInit(path, record);
						this.internalLink.processInit(path, record);
						this.externalLink.processInit(path, record);
					},

					setValue : function(value) {
						var link = JSON.parse(value);
						this.linkText.setValue(link.text);
						this.internalLink.setValue(link.internalLink);
						this.externalLink.setValue(link.externalLink);
						this.hiddenField.setValue(value);
					},

					getValue : function() {
						return this.getRawValue();
					},

					getRawValue : function() {
						var link = {
							"internalLink" : this.internalLink.getValue(),
							"text" : this.linkText.getValue(),
							"externalLink" : this.externalLink.getValue()
						};
						return JSON.stringify(link);
					},

					updateHidden : function() {
						this.hiddenField.setValue(this.getValue());
					}
				});

CQ.Ext.reg('linksmultifield', CQ.form.CustomPathFieldWidget);
/**
 * @author aditya.vennelakanti, MRM Detroit
 * @since GMDS Release 3.11
 */
CQ.form.rte.commands.MultiColorCommand = CQ.Ext.extend(CQ.form.rte.commands.Command, {
    
	/**
     * Creates a styled link from the current selection.
     * @private
     */
    addColorToDom: function(execDef) {
        var context = execDef.editContext;
        var nodeList = execDef.nodeList;
        var selectedColor = execDef.value.color;
        var splits = selectedColor.split("|");
        var styleName = splits[1];
        var colorCode = splits[0];
        var attributes = execDef.value.attributes || { };
        var styles = [ ];
        nodeList.getStyles(context, styles, true);
        if (styles.length > 0) {
            // modify existing style(s)
            for (var i = 0; i < links.length; i++) {
                this.applyStyleProperties(styles[i].dom, styleName);
            }
        } else {
            // create new style
            var sel = CQ.form.rte.Selection;
            var dpr = CQ.form.rte.DomProcessor;
            if (execDef.value.trimLinkSelection === true) {
                var range = sel.getLeadRange(context);
                range = sel.trimRangeWhitespace(win, range);
                sel.selectRange(context, range);
                nodeList = dpr.createNodeList(context, sel.createProcessingSelection(context));
            }

            attributes.style='color:#' + colorCode;
            attributes.textcolor=styleName;
            attributes.className=styleName;
            nodeList.surround(context, "span", attributes);
        }
    },

    /**
     * Applies style properties (color=) to the given span dom element.
     * @param {HTMLElement} dom DOM element the style properties will be applied to
     * @param {String} styleProp the style property to set
     * @private
     */
    applyStyleProperties: function(dom, styleProp) {
        var com = CQ.form.rte.Common;
        com.setAttribute(dom, "style", "color:" + styleProp);
    },
    
    /**
     * Removes a styled ssi link according to the current selection.
     * @private
     */
    removeColorFromDom: function(execDef) {
        var dpr = CQ.form.rte.DomProcessor;
        var context = execDef.editContext;
        var nodeList = execDef.nodeList;
        var styles = [ ];
        nodeList.getStyles(context, styles, true);
        styles = styles.styles;
        var length = styles.length;

        for (var i = 0; i < length; i++) {
        	var style = styles[i];
        	console.log(style);
            dpr.removeWithoutChildren(style.dom);
        }
    },

    isCommand: function(cmdStr) {
        var cmdLC = cmdStr.toLowerCase();
        return (cmdLC == "modifycolor") || (cmdLC == "removecolor");
    },

    getProcessingOptions: function() {
        var cmd = CQ.form.rte.commands.Command;
        return cmd.PO_BOOKMARK | cmd.PO_SELECTION | cmd.PO_NODELIST;
    },

    execute: function(execDef) {
        switch (execDef.command.toLowerCase()) {
            case "modifycolor":
                this.addColorToDom(execDef);
                break;
            case "removecolor":
                this.removeColorFromDom(execDef);
                break;
        }
    },
    
    queryState: function(selectionDef, cmd) {
        return false;
    }
});

//register command
CQ.form.rte.commands.CommandRegistry.register("multicolor", CQ.form.rte.commands.MultiColorCommand);

/**
 * @author aditya.vennelakanti, MRM Detroit
 * @class CQ.form.RTEPlugins.Color
 * 
 * Custom richtext editor plugin to apply colors to selected text.
 */
CQ.form.rte.plugins.ColorPlugin = CQ.Ext.extend(CQ.form.rte.plugins.Plugin, {

    /**
     * @private
     */
    multiColorDialog: null,

    /**
     * @private
     */
    addColorUI: null,

    /**
     * @private
     */
    removeColorUI: null,

	/**
	 * constructor
	 */
    constructor: function(editorKernel) {
    	CQ.form.rte.plugins.ColorPlugin.superclass.constructor.call(this, editorKernel);
    },

    /**
	 * gets the available features
	 */
	getFeatures: function() {
		return [ "modifycolor", "removecolor" ];
	},

	/**
	 * Sets the color of text using a dialog
	 * @private
	 */
	modifyColor: function(context) {
		var _options='[{value:\"\", text:\"- No options available -\"}]';
		_options=eval(_options);
		var _optionsOnInit = gmdsColorOpts().getColorOptions(this.editorKernel.getContentPath(), 'textcolorpicker');
		if(_optionsOnInit !== undefined) {
			_options = _optionsOnInit;
		} else {
			_options = gmdsColorOpts().getTextColorOptionsFromCompany(this.editorKernel.getContentPath());
		}
		_options.splice(0, 1); // Remove the first entry --> which is "none"
		
		if(!this.multiColorDialog) {
			var defaultConfig = {
				"jcr:primaryType" : "cq:Dialog",
				"title" : CQ.I18n.getMessage("Color"),
				"modal" : true,
				"border" : false,
				"plain" : true,
				"width" : 400,
                "height" : 220, 
                "xtype" : "dialog", 
                "buttons" : CQ.Dialog.OKCANCEL, 
                "resetValues" : function(newOptions) {
                	this.getField("./color").setOptions(newOptions);
                },
                "setOption" : function(span) {
                    this.getField("./color").setValue(span.dom.getAttribute('class'));
                },
                "ok" : function() {
                    this.multiColorDialog.hide();
                    if (CQ.Ext.isIE) {
                        this.savedRange.select();
                    }
                    this.editorKernel.relayCmd("modifycolor", {
                        "color" : this.multiColorDialog.getField("./color").getValue(),
                        "attributes" : {
                        	"class" : this.multiColorDialog.getField("./color").getValue()
                        }
                    });
                    this.editorKernel.deferFocus();
                }.createDelegate(this),
                "items" : {
                	"jcr:primaryType" : "cq:Panel",
                	"xtype" : "panel",
                	"items" : {
                		"jcr:primaryType" : "cq:WidgetCollection",
                		"color" : {
                			"jcr:primaryType" : "cq:Widget",
                            "fieldLabel" : "Color",
                            "name" : "./color",
                            "type" : "select",
                            "xtype" : "selection",
                            "options" : _options
                		}
                	}
                }
            };
			if (!this.multiColorDialogConfig) {
                this.multiColorDialogConfig = {};
            }
            CQ.Util.applyDefaults(this.multiColorDialogConfig,defaultConfig);
            this.multiColorDialog = new CQ.Util.build(this.multiColorDialogConfig);
        } else {
            this.multiColorDialog.resetValues(_options);
        }
		var selectionDef = this.editorKernel.analyzeSelection();
        if (selectionDef.styleCount == 1) {
            this.multiColorDialog.setOption(selectionDef.styles[0]);
        }        
        if (CQ.Ext.isIE) {
            this.savedRange = context.doc.selection.createRange();
        }
        this.multiColorDialog.show();
        window.setTimeout( function() {
            this.multiColorDialog.toFront();
        }.createDelegate(this), 10);
	},

	/**
	 * Initializes the user interface
	 */
	initializeUI: function(tbGenerator) {
		if (this.isFeatureEnabled("modifycolor")) {
            this.addColorUI = new CQ.form.rte.ui.TbElement("modifycolor", this, false, this.getTooltip("modifycolor"));
            tbGenerator.addElement("multicolor", CQ.form.rte.plugins.Plugin.SORT_LINKS + 5, this.addColorUI, 10);
        }
        if (this.isFeatureEnabled("removecolor")) {
            this.removeColorUI = new CQ.form.rte.ui.TbElement("removecolor", this, false, this.getTooltip("removecolor"));
            tbGenerator.addElement("multicolor", CQ.form.rte.plugins.Plugin.SORT_LINKS + 5, this.removeColorUI, 20);
        }
    },

    /**
     * Sets up the plugin configuration
     */
    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        CQ.Util.applyDefaults(pluginConfig, {
            "tooltips": {
                "modifycolor": {
                    "title": CQ.I18n.getMessage("Text Color"),
                    "text": CQ.I18n.getMessage("Add color to the selected text.")
                },
                "removecolor": {
                    "title": CQ.I18n.getMessage("Text Color"),
                    "text": CQ.I18n.getMessage("Remove color from the selected text.")
                }
            }
        });
        this.config = pluginConfig;
    },

    /**
     * Execution of the plugin
     */
    execute: function(cmd, value, env) {
        if (cmd == "modifycolor") {
            this.modifyColor(env.editContext);
        } else {
            this.editorKernel.relayCmd(cmd);
        }
    },

    /**
     * Update the state of the widget
     */
    updateState: function(selDef) {
    	var hasStyle = selDef.styleCount > 0;
        var hasNoStyle = selDef.styleCount === 0;
        var selectedNode = selDef.selectedDom;
        var isStyleableObject = false;
        if (selectedNode) {
            isStyleableObject = CQ.form.rte.Common.isTag(selectedNode, CQ.form.rte.plugins.StylesPlugin.STYLEABLE_OBJECTS);
        }
        var isCreateColorEnabled = ((selDef.isSelection || isStyleableObject) && hasNoStyle);
        if (this.addColorUI) {
            this.addColorUI.getExtUI().setDisabled(!isCreateColorEnabled);
        }
        if (this.removeColorUI) {
            this.removeColorUI.getExtUI().setDisabled(hasNoStyle);
        }
    }
});


// register plugin
CQ.form.rte.plugins.PluginRegistry.register("multicolor", CQ.form.rte.plugins.ColorPlugin);

/**
 * @class CQ.form.YoutubeParameterGrid
 * @extends CQ.form.MultiField
 */
CQ.form.YoutubeParameterGrid = CQ.Ext.extend(CQ.form.MultiField, {

	
	constructor: function(config) {	
		
		config.title = "<table><tr><td style='width:140px'><b>Value</b></td><td><b>Value Label</b></td></tr></table>";
		config.headerCfg = {
				cls: "",
				style: "padding-top: 5px; padding-bottom: 5px; padding-left: 5px; border: 1px #99BBE8 solid; border-bottom: 0;",
		};
		
		config.fieldConfig = {
				xtype: "youtubeparameterfield"
		};
					
		CQ.form.YoutubeParameterGrid.superclass.constructor.call(this,config);	
		
		
				
	}
		
    
});

CQ.Ext.reg("youtubeparametergrid", CQ.form.YoutubeParameterGrid);

/**
 * @class CQ.form.MultiTextField
 * @extends CQ.form.CompositeField
 * This is a custom widget based on {@link CQ.form.CompositeField}.
 * @constructor
 * Creates a new CustomWidget.
 * @param {Object} config The config object
 */
CQ.form.YoutubeParameterField = CQ.Ext.extend(CQ.form.CompositeField, {

	 /**
     * @private
     * @type CQ.Ext.form.TextField
     */
    hiddenField: null,

    /**
     * @private
     * @type Array(CQ.Ext.form.TextField)
     */
    fields: [],
    
    constructor: function(config) {
        config = config || { };
        var defaults = {
            "border": false,
            "layout": "table",
            "columns": 2
        };
        this.config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.YoutubeParameterField.superclass.constructor.call(this, this.config);
    },

    // overriding CQ.Ext.Component#initComponent
    initComponent: function() {
        CQ.form.YoutubeParameterField.superclass.initComponent.call(this);

        this.hiddenField = new CQ.Ext.form.Hidden({
            name: this.name
        });
        this.add(this.hiddenField);
        
        this.fields = [];

        for (var i=0; i<2; i++) {
        	var field = new CQ.Ext.form.TextField({
        		hideLabel: true,
        		required: true,
        		style:'margin-right: 5px;',
                listeners: {
                    change: {
                        scope:this,
                        fn:this.updateHidden
                    }
                }
            });
        	this.fields.push(field);
            this.add(field);
           
        }

    },

    // overriding CQ.form.CompositeField#processPath
    processPath: function(path) {
        for (var i=0; i<this.fields.length; i++) {
        	this.fields[i].processPath(path);
    	}
    },

    // overriding CQ.form.CompositeField#processRecord
    processRecord: function(record, path) {
        for (var i=0; i<this.fields.length; i++) {
        	this.fields[i].processRecord(record, path);
    	}
    },

    // overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
        var parts = value.split("|");
        var j=0;
        for (var i=0; i<parts.length; i++) {
        	if ((parts[i][parts[i].length-1] === '\\')&&(parts.length > i+1)) {
        		parts[i+1] = parts[i] + '|' + parts[i+1];
        	} else {
	        	if (j < this.fields.length) {
	        		this.fields[j].setValue(parts[i].replace(/\\\|/g, '|'));
	        		j += 1;
	        	}
        	}
        }
        this.hiddenField.setValue(value);
    },

    // overriding CQ.form.CompositeField#getValue
    getValue: function() {
        return this.getRawValue();
    },

    // overriding CQ.form.CompositeField#getRawValue
    getRawValue: function() {
        if (this.fields.length === 0) {
            return null;
        }
        var values = [];
        for (var i=0; i<this.fields.length; i++) {
        	values[i] = this.fields[i].getValue() ? this.fields[i].getValue() : '';
        	values[i] = values[i].replace(/\|/g, '\\|');
        }
        return values.join('|');
    },

    // private
    updateHidden: function() {
        this.hiddenField.setValue(this.getValue());
    }

});

// register xtype
CQ.Ext.reg('youtubeparameterfield', CQ.form.YoutubeParameterField);

CQ.form.MultiFieldCustom = CQ.Ext
		.extend(
				CQ.form.CompositeField,
				{

					hiddenField : null,
					newform : null,
					

					constructor : function(config) {
						config = config || {};
						var defaults = {
						};
						config = CQ.Util.applyDefaults(config, defaults);
						CQ.form.MultiFieldCustom.superclass.constructor.call(
								this, config);
					},

					// overriding CQ.Ext.Component#initComponent
					initComponent : function() {
						CQ.form.MultiFieldCustom.superclass.initComponent
								.call(this);
				        this.hiddenField = new CQ.Ext.form.Hidden({
				            name: this.name
				        });
				        this.add(this.hiddenField);
						this.newform = new CQ.Ext.FormPanel(
								{

									defaults : {
										layout : "form",
										border : false
									},
									items : [ {
										xtype : "fieldset",
										itemId : "fieldset1",
										title : "Alternative Style",
										items : [
												
												{
													xtype : 'textfield',
													cls : "customwidget-1",
													fieldLabel : "Configuration Name*",
													itemId : "configurationName",
													allowBlank : false,
													width : 300,
													listeners : {
														change : {
															scope : this,
															fn : this.updateHidden
														}
													}
												},
												
												{
													xtype : 'browsefield',
													cls : "customwidget-2",
													fieldLabel : "Image",
													defaultValue: "/content/dam",
													itemId : "image",
													allowBlank : true,
													width : 300,
													listeners : {
														change : {
															scope : this,
															fn : this.updateHidden
														}
													}

												},
												
												{
													xtype : 'textfield',
													cls : "customwidget-3",
													fieldLabel : "Alt Text",
													itemId : "altText",
													fieldDescription : "The alternative text will be shown if the image cannot be displayed",
													allowBlank : true,
													width : 300,
													listeners : {
														change : {
															scope : this,
															fn : this.updateHidden
														}
													}
												},
												{
													xtype : 'textfield',
													cls : "customwidget-4",
													fieldLabel : "Button Text",
													allowBlank : true,
													itemId : "buttonText",
													width : 300,
													listeners : {
														change : {
															scope : this,
															fn : this.updateHidden
														}
													}
												},
												{
													xtype : 'textfield',
													cls : "customwidget-5",
													fieldLabel : "Linktitle",
													itemId : "linkTitle",
													fieldDescription : "Enter an alternative link title here to add information about the nature of a link.  Link titles will be shown in a tooltip",
													allowBlank : true,
													width : 300,
													listeners : {
														change : {
															scope : this,
															fn : this.updateHidden
														}
													}
												},

												{
													xtype : 'browsefield',
													cls : "customwidget-6",
													fieldLabel : "External Link",
													itemId : "externalLink",
													fieldDescription : "External links can only be inserted from the External Link Library",
													allowBlank : true,
													width : 300,
													listeners : {
														change : {
															scope : this,
															fn : this.updateHidden
														}
													}

												},

												{
													xtype : 'textfield',
													cls : "customwidget-7",
													fieldLabel : "Position",
													itemId : "position",
													fieldDescription : "Specify the position value from the top of the page in pixels OR percentages. For example: 80px or 80%",
													allowBlank : true,
													width : 300,
													listeners : {
														change : {
															scope : this,
															fn : this.updateHidden
														}
													}
										
												}

										]
									} ]
								});

						this.add(this.newform);

					},

					// overriding CQ.form.CompositeField#processPath
				    processPath: function(path, ignoreData) {
				    	
				       for ( var i = 0; i < this.newform.items.getCount(); i++) {
							var fieldset_ = this.newform.items.first();
							for ( var j = 0; j < fieldset_.items.getCount(); j++) {
	                          fieldset_.items.itemAt(j).processPath(path);
	                           
				    	    }
				       }	
				    },

				    // overriding CQ.form.CompositeField#processRecord
				    processRecord: function(record, path) {
				    		var fieldset_ = this.newform.items.first();
						for ( var j = 0; j < fieldset_.items.getCount(); j++) {
								fieldset_.items.itemAt(j).processRecord(record, path);
							}   
				    },
					// overriding CQ.form.CompositeField#setValue
					setValue : function(value) {
						var fieldset_ = this.newform.items.first();
						     var formValueArray = value.split(",");
					        var k=0;
					        for (var i=0; i<formValueArray.length; i++) {
					        	var parts = formValueArray[i].split("|");
					        	
					        	for (var j=0; j<parts.length; j++){
					        	if ((parts[j][parts[j].length-1] === '\\')&&(parts.length > j+1)) {
					        		parts[j+1] = parts[j] + '|' + parts[j+1];
					        	} else {
						        	if (k < fieldset_.items.getCount()) {
						        		fieldset_.items.itemAt(k).setValue(parts[k].replace(/\\\|/g, '|'));
						        		k += 1;
						        	}
					        	}
					        }
					        }
						
					},

					// overriding CQ.form.CompositeField#getValue
					getValue : function() {
						return this.getRawValue();
					},

					// overriding CQ.form.CompositeField#getRawValue
					getRawValue : function() {
						if (this.newform.items.getCount() == 0) {
							return null;
						}
						var values = [];
						for ( var i = 0; i < this.newform.items.getCount(); i++) {
							var fieldset_ = this.newform.items.first();
							if (typeof (fieldset_) !== "undefined") {
								for ( var j = 0; j < fieldset_.items.getCount(); j++) {
									if (typeof (fieldset_.items.itemAt(j)
											.getEl()) !== "undefined") {
										values[j] = typeof (fieldset_.items
												.itemAt(j).getEl().getValue()) !== "undefined" ? fieldset_.items
												.itemAt(j).getEl().getValue()
												: '';

										values[j] = values[j].replace(/\|/g,
												'\\|');
									}
								}
							}
							this.hiddenField.setValue(values.join('|'));
							return values.join('|');
						}
					},
					// private
					updateHidden : function() {
						this.hiddenField.setValue(this.getValue());
					}

				});
// register xtype
CQ.Ext.reg('multifieldcustom', CQ.form.MultiFieldCustom);
CQ.form.MultiFieldFeaturesAndSpecs = CQ.Ext.extend(CQ.form.CompositeField, {

	/**
	 * @private
	 * @type CQ.Ext.form.TextField
	 */
	hiddenField : null,

	/**
	 * @private
	 * @type CQ.Ext.form.Checkbox
	 */
	checkboxField : null,

	/**
	 * @private
	 * @type CQ.Ext.form.ComboBox
	 */
	comboboxField : null,

	constructor : function(config) {
		config = config || {};
		var defaults = {
			"border" : false,
			"layout" : "table",
			"columns" : 2
		};
		config = CQ.Util.applyDefaults(config, defaults);
		CQ.form.MultiFieldFeaturesAndSpecs.superclass.constructor.call(this,
				config);
	},

	// overriding CQ.Ext.Component#initComponent
	initComponent : function() {
		CQ.form.MultiFieldFeaturesAndSpecs.superclass.initComponent.call(this);

		this.hiddenField = new CQ.Ext.form.Hidden({
			name : this.name
		});
		this.add(this.hiddenField);

		this.checkboxField = new CQ.Ext.form.Checkbox({
			cls : "customwidget-1",
			listeners : {
				check : {
					scope : this,
					fn : this.updateHidden
				}
			}

		});
		this.add(this.checkboxField);

		this.comboboxField = new CQ.form.Selection({
			type : "select",
			cls : "customwidget-2",
			listeners : {
				selectionchanged : {
					scope : this,
					fn : this.updateHidden
				}
			},
			options : this.setComboboxOptions()

		});
		this.add(this.comboboxField);
	},

	// overriding CQ.form.CompositeField#processPath
	processPath : function(path) {
		this.comboboxField.processPath(path);
		this.checkboxField.processPath(path);
	},

	// overriding CQ.form.CompositeField#processRecord
	processRecord : function(record, path) {
		this.comboboxField.processRecord(record, path);
		this.checkboxField.processRecord(record, path);
	},

	// overriding CQ.form.CompositeField#setValue
	setValue : function(value) {

		if (value.contains('~')) {
			// this is the data read from the features property which is in the new format which has ~ as delimiter  
			var fieldparts = value.split("~");
			this.comboboxField.setValue(fieldparts[0]);
			this.checkboxField.setValue(fieldparts[1]);
		} else {
			// this is the data read from the features property which is in the old format which does not have ~
			this.comboboxField.setValue(value);
			this.checkboxField.setValue('false');
			value = value + '~false';
		}

		this.hiddenField.setValue(value);

	},

	// overriding CQ.form.CompositeField#getValue
	getValue : function() {
		return this.getRawValue();
	},

	// overriding CQ.form.CompositeField#getRawValue
	getRawValue : function() {
		return this.comboboxField.getValue() + '~'
				+ this.checkboxField.getValue();
	},

	// private
	updateHidden : function() {
		this.hiddenField.setValue(this.getValue());
	},

	setComboboxOptions : function() {
		var path = CQ.WCM.getPagePath();

		var options = {};
		mrm.$.ajax({
			async : false,
			url : path + '.wishlist-features.json',
			type : 'GET',
			cache : false,
			success: function(data) {
				options=data;
			}
		});

		return options;
	}

});
// register xtype
CQ.Ext.reg('multifieldfeaturesandspecs', CQ.form.MultiFieldFeaturesAndSpecs);
/**
 * The <code>MultiSelectionCheckboxGroup</code> class represents an editable list
 * of checkboxes fields for editing multi value properties.
 * 
 * @author martin.delallave@mrmworldwide.com.ar, mdelallave MRM
 * @class CQ.form.MultiSelectionCheckboxGroup
 * @extends CQ.form.CompositeField
 */

CQ.form.MultiSelectionCheckboxGroup = CQ.Ext.extend(CQ.form.CompositeField, {
    /**
     * @cfg {Object} autoScroll
     * The configuration options for the fields (optional).
     */
    autoScroll: null,
    /**
     * @cfg {Object} storeName
     * The configuration options for the fields (optional).
     */
    storeName: null,
    /**
     * @cfg {Object} fieldLabel
     * The configuration options for the fields (optional).
     */
    fieldLabel: null,
    /**
     * @cfg {Object} checkboxes
     * The configuration options for the fields (optional).
     */
    checkboxes: null,
    /**
     * @cfg {String} currentCrxPath
     * Current crx path where the dialog data is stored.
     */
    currentCrxPath: null,
    /**
     * @cfg {String} currentCrxPath
     * Current crx path where the dialog data is stored.
     */
    itemStorageNode: null,
    /**
     * @cfg {Object} dialog
     * Dialog that contains the grid widget.
     */
    dialog: null,
    /**
     * Creates a new <code>CQ.Ext.form.CheckboxGroup</code>.
     * @constructor
     * @param {Object} config The config object
     */
    constructor: function (config) {
      //Setting the values retrieved from the dialog.xml
      this.itemStorageNode = config.name;
      this.autoScroll = config.autoScroll;
      this.storeName = config.storeName;
      this.fieldLabel = config.fieldLabel;
      var that = this;
      var items = [];
      var data =[];

      var undesiredParams = document.URL.substring(document.URL.indexOf("cq_ck")-1,document.URL.length);
      this.currentCrxPath = document.URL.substring(document.URL.indexOf("#")+1,document.URL.length).replace(".html","").replace(undesiredParams,"")+"/jcr:content/hmc_c1";
      
      if (this.currentCrxPath) {
          var storeUrl = this.currentCrxPath + "." + this.storeName + ".json?storage_node=" + this.itemStorageNode;
          var response = CQ.HTTP.get(storeUrl);
          data = CQ.HTTP.eval(response);
       }
      
      this.checkboxes = new CQ.Ext.form.CheckboxGroup({
          id: 'checkboxes',
    	  xtype: 'checkboxgroup',
    	  fieldLabel: this.fieldLabel,
          autoScroll:this.autoScroll,
          vertical: true,
          columns: 1,
          items: data
      });
      
      items.push(this.checkboxes); 
      
      config = CQ.Util.applyDefaults(config, {
          "items": items,
          "layout": "hbox",
          "width": 200,
          "height": 200,
      });
      
      CQ.Ext.form.CheckboxGroup.superclass.constructor.call(this, config);
   
      var parentDialog = this.findParentByType('dialog');
      parentDialog.on("beforesubmit", function (e) {
            that.submitStore(that.checkboxes.items);
      })
    },
    
    // private
    /**
     * Initializes <code>CQ.Ext.form.CheckboxGroup</code>.
     * Registers the event handlers.
     */
    initComponent: function () {
        CQ.form.CompositeField.superclass.initComponent.call(this);
        this.addEvents(CQ.form.Selection.EVENT_SELECTION_CHANGED);
    },   
    
    /**
     * Submits the store and posts the checkboxes data back to the store.
     * 
     * @param store store containing data
     */
    submitStore : function (store) {
      var json = {items:[]};
      store.each(function(item){
    	  json.items.push({name:item.name,boxLabel:item.boxLabel,checked:item.checked});
      });
      
      var jsonString = CQ.Ext.encode(json);
      
      var storeUrl = this.currentCrxPath + "." + this.storeName + ".json";
      
      var params = {
          storage_node: this.itemStorageNode, 
          json: jsonString,
          '_charset_': 'utf-8'
      };
      CQ.HTTP.post(storeUrl, function (options, success, response) {}, params, null, true);
      return true;
    },
    
    /**
     * Method that is called if a dialog record is processed.
     * Saves the current crx path and updates the store.
     * 
     * @param record current record
     * @param path current crx path
     */
    processRecord: function (record, path) {
        if(path.substring(path.length - 1) !== '/' && path.substring(path.length - 1) !== '*' ) {
              this.currentCrxPath = path;
        }
    }
    
});

CQ.Ext.reg("multiselectioncheckboxgroup", CQ.form.MultiSelectionCheckboxGroup);
CQ.form.VisualizerViewsByOption = CQ.Ext.extend(CQ.form.CompositeField, {
    /**
     * @private
     * @type CQ.Ext.form.TextField
     */
    hiddenField: null,

    /**
     * @private
     * @type CQ.Ext.form.Selection
     */
    optionField: null,

    /**
     * @private
     * @type CQ.Ext.form.Selection
     */
    visualizerViewField: null,
    
    constructor: function(config) {
        config = config || { };
        var defaults = {
        		"border" : false,
    			"layout" : "table",
    			"columns" : 2
        };
        config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.VisualizerViewsByOption.superclass.constructor.call(this, config);
    },

    // overriding CQ.Ext.Component#initComponent
    initComponent: function() {
    	CQ.form.VisualizerViewsByOption.superclass.initComponent.call(this);

        this.hiddenField = new CQ.Ext.form.Hidden({
            name: this.name
        });
        this.add(this.hiddenField);
        
        this.optionField = new CQ.form.Selection({
    		allowBlank: false,
            type: 'select',
            listeners: {
                selectionchanged: {
                    scope:this,
                    fn: this.updateHidden
                }
            },
            options: this.setOptionFieldOptions()
        });
        
        this.add(this.optionField);        
        
        this.visualizerViewField = new CQ.form.Selection({
        	allowBlank: false,
            type: 'select',
            listeners: {
                selectionchanged: {
                    scope:this,
                    fn: this.updateHidden
                }
            },
            options: this.setVisualizerViewFieldOptions()
        });
        
        
        this.add(this.visualizerViewField);        
    },

    // overriding CQ.form.CompositeField#processPath
    processPath: function(path) {
        this.optionField.processPath(path);
        this.visualizerViewField.processPath(path);
    },

    // overriding CQ.form.CompositeField#processRecord
    processRecord: function(record, path) {
        this.optionField.processRecord(record, path);
        this.visualizerViewField.processRecord(record, path);
    },

    // overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
        var json = CQ.Ext.util.JSON.decode(value);
        this.optionField.setValue(json.option);
        this.visualizerViewField.setValue(json.nameOfView);
        this.hiddenField.setValue(value);
    },

    // overriding CQ.form.CompositeField#getValue
    getValue: function() {
        return this.getRawValue();
    },

    // overriding CQ.form.CompositeField#getRawValue
    getRawValue: function() {
        if (!this.optionField || !this.visualizerViewField) {
            return CQ.Ext.util.JSON.encode({option: '', nameOfView: ''});
        }
        return CQ.Ext.util.JSON.encode({
        	option: this.optionField.getValue(),
        	nameOfView: this.visualizerViewField.getValue()
        });
    },

    // private
    updateHidden: function() {
        this.hiddenField.setValue(this.getValue());
    },
    
    //private
    setOptionFieldOptions : function() {
		var path = CQ.WCM.getPagePath();

		var options = {};
		mrm.$.ajax({
			async : false,
			url : path + '.wishlist-features.json',
			type : 'GET',
			cache : false,
			success: function(data) {
				options=data;
			}
		});

		return options;
	},
    
	//private
    setVisualizerViewFieldOptions : function() {
    	
		var path = CQ.WCM.getPagePath();
        var exteriorConfigName = '';
        var interiorConfigName = '';
        var isExterior = false;
        var isInterior = false;
        
        for (var i = 0; i < this.optionField.ownerCt.findParentByType('panel').items.length; i++) {
        	item = this.optionField.ownerCt.findParentByType('panel').items.itemAt(i);
       	   if (item.name == './extCgiConfig') {
				exteriorConfigName = item.getValue();	
				isExterior = true;
			}
			
			if (item.name == './intCgiConfig') {
				interiorConfigName = item.getValue();	
				isInterior = true;
			}
		}
        
		var optionsExterior = [];
		if (isExterior){
		mrm.$.ajax({async:false, 
			url:'/bin/cgi-views-options.json?cgiConfigName='+exteriorConfigName+'&ext_cgi_views&resPath='+path, 
			type:'GET', 
			cache :false,
			success: function(data) {
				optionsExterior=data;
			}
		
		});
    }
		var optionsInterior = [];
		if (isInterior){
		mrm.$.ajax({async:false, 
			url:'/bin/cgi-views-options.json?cgiConfigName='+interiorConfigName+'&ext_cgi_views&resPath='+path, 
			type:'GET', 
			cache :false,
			success: function(data) {
				optionsInterior=data;
			}
		
		});
    }
		if (optionsExterior.length > 0){
			for (var j=0; j<optionsExterior.length; j++){
				optionsExterior[j].text = 'Exterior: ' + optionsExterior[j].text;
				optionsExterior[j].value = 'exterior|' + optionsExterior[j].text + '|' +optionsExterior[j].value;
			}
		}
		
		if (optionsInterior.length > 0){
			for (var k=0; k<optionsInterior.length; k++){
				optionsInterior[k].text = 'Interior: ' + optionsInterior[k].text;
				optionsInterior[k].value = 'interior|' + optionsInterior[k].text + '|' +  optionsInterior[k].value;
			}
		}
		
		var viewAndOptions = [];
		
		if (optionsExterior.length > 0){
			for (i=0; i<optionsExterior.length; i++){
				viewAndOptions.push(optionsExterior[i]);
			}
		}
		
		if (optionsInterior.length > 0){
			for (i=0; i<optionsInterior.length; i++){
				viewAndOptions.push(optionsInterior[i]);
			}
	    }
	
		return viewAndOptions;
	}

});
// register xtype
CQ.Ext.reg('visualizerviewsbyoption', CQ.form.VisualizerViewsByOption);

CQ.form.VisualizerBodyStyleGroup = CQ.Ext.extend(CQ.form.CompositeField, {
    /**
     * @private
     * @type CQ.Ext.form.TextField
     */
    hiddenField: null,

    /**
     * @private
     * @type CQ.Ext.form.Selection
     */
    optionField: null,

    /**
     * @private
     * @type CQ.Ext.form.TextField
     */
    labelField: null,
    
    constructor: function(config) {
        config = config || { };
        var defaults = {
        		"border" : false
        };
        config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.VisualizerBodyStyleGroup.superclass.constructor.call(this, config);
    },

    // overriding CQ.Ext.Component#initComponent
    initComponent: function() {
    	CQ.form.VisualizerBodyStyleGroup.superclass.initComponent.call(this);

        this.hiddenField = new CQ.Ext.form.Hidden({
            name: this.name
        });
        this.add(this.hiddenField);
        
   	
        this.labelField = new CQ.Ext.form.TextField({
     	   fieldLabel : CQ.I18n.getMessage('group_label'),
         	style: {
     			width: '95%'
     		},
            listeners: {
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
         });
         
         
         this.add(this.labelField);   
 
	
       	this.optionField = new CQ.form.Selection({
       		fieldLabel : CQ.I18n.getMessage('cab_config_label'),
    		type: 'select',
    		fieldDescription:CQ.I18n.getMessage('cab_config_desc'),
            listeners: {
                selectionchanged: {
                    scope:this,
                    fn: this.updateHidden
                }
            },
            options:  CQ.WCM.getPagePath() + '.default-item-types.json?parameter=cab_config'
        });
        
        this.add(this.optionField);        
     },

    // overriding CQ.form.CompositeField#processPath
    processPath: function(path) {
        this.optionField.processPath(path);
        this.labelField.processPath(path);
    },

    // overriding CQ.form.CompositeField#processRecord
    processRecord: function(record, path) {
        this.optionField.processRecord(record, path);
        this.labelField.processRecord(record, path);
    },

    // overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
    	var json = CQ.Ext.util.JSON.decode(value);
        this.optionField.setValue(json.option);
        this.labelField.setValue(json.label);
        this.hiddenField.setValue(value);
    },

    // overriding CQ.form.CompositeField#getValue
    getValue: function() {
        return this.getRawValue();
    },

    // overriding CQ.form.CompositeField#getRawValue
    getRawValue: function() {
        if (!this.optionField || !this.labelField) {
            return CQ.Ext.util.JSON.encode({option: '', label: ''});
        }
        return CQ.Ext.util.JSON.encode({
        	option: this.optionField.getValue(),
        	label: this.labelField.getValue()
        });
    },

    // private
    updateHidden: function() {
        this.hiddenField.setValue(this.getValue());
    }

});
// register xtype
CQ.Ext.reg('visualizerBodyStyleGroup', CQ.form.VisualizerBodyStyleGroup);

CQ.form.T13YearVehicleGroup = CQ.Ext.extend(CQ.form.CompositeField, {
    /**
     * @private
     * @type CQ.Ext.form.TextField
     */
    hiddenField: null,

    /**
     * @private
     * @type CQ.Ext.form.Selection
     */
    year: null,

    /**
     * @private
     * @type CQ.Ext.form.Selection
     */
    vehicle: null,
    
    constructor: function(config) {
        config = config || { };
        var defaults = {
        		"border" : false
        };
        config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.T13YearVehicleGroup.superclass.constructor.call(this, config);
    },

    // overriding CQ.Ext.Component#initComponent
    initComponent: function() {
    	CQ.form.T13YearVehicleGroup.superclass.initComponent.call(this);

        this.hiddenField = new CQ.Ext.form.Hidden({
            name: this.name
        });
        this.add(this.hiddenField);
        
   	
       	this.year = new CQ.form.Selection({
       		fieldLabel : CQ.I18n.getMessage('t13_year_label'),
    		type: 'select',
            listeners: {
                selectionchanged: {
                    scope:this,
                    fn: this.updateHidden
                }
            },
            options:  CQ.WCM.getPagePath() + '.vehicle-year-option.json?parameter=year'
        });
        
        this.add(this.year);     
 
	
       	this.vehicle = new CQ.form.Selection({
       		fieldLabel : CQ.I18n.getMessage('t13_vehicle_label'),
    		type: 'select',
            listeners: {
                selectionchanged: {
                    scope:this,
                    fn: this.updateHidden
                }
            },
            options:  CQ.WCM.getPagePath() + '.vehicle-year-option.json?parameter=vehicle'
        });
        
        this.add(this.vehicle);        
     },

    // overriding CQ.form.CompositeField#processPath
    processPath: function(path) {
        this.year.processPath(path);
        this.vehicle.processPath(path);
    },

    // overriding CQ.form.CompositeField#processRecord
    processRecord: function(record, path) {
        this.year.processRecord(record, path);
        this.vehicle.processRecord(record, path);
    },

    // overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
    	var json = CQ.Ext.util.JSON.decode(value);
        this.year.setValue(json.year);
        this.vehicle.setValue(json.vehicle);
        this.hiddenField.setValue(value);
    },

    // overriding CQ.form.CompositeField#getValue
    getValue: function() {
        return this.getRawValue();
    },

    // overriding CQ.form.CompositeField#getRawValue
    getRawValue: function() {
        if (!this.vehicle || !this.year) {
            return CQ.Ext.util.JSON.encode({year: '', vehicle: ''});
        }
        return CQ.Ext.util.JSON.encode({
        	year: this.year.getValue(),
        	vehicle: this.vehicle.getValue()
        });
    },

    // private
    updateHidden: function() {
        this.hiddenField.setValue(this.getValue());
    }

});
// register xtype
CQ.Ext.reg('t13YearVehicleGroup', CQ.form.T13YearVehicleGroup);

var ClientLib = ClientLib || {};
 
ClientLib.MultiPanel = CQ.Ext.extend(CQ.Ext.Panel, {
    panelValue: '',
 
    constructor: function(config){
        config = config || {};
        ClientLib.MultiPanel.superclass.constructor.call(this, config);
    },
 
    initComponent: function () {
        ClientLib.MultiPanel.superclass.initComponent.call(this);
 
        this.panelValue = new CQ.Ext.form.Hidden({
            name: this.name
        });
 
        this.add(this.panelValue);
 
        var dialog = this.findParentByType('dialog');
 
        dialog.on('beforesubmit', function(){
            var value = this.getValue();
 
            if(value){
                this.panelValue.setValue(value);
            }
        },this);
    },
 
    getValue: function () {
        var pData = {};
 
        this.items.each(function(i){
            if(i.xtype == "label" || i.xtype == "hidden" || !i.hasOwnProperty("dName")){
                return;
            }
 
            pData[i.dName] = i.getValue();
        });

        return JSON.stringify(pData) === '{}' ? "" : JSON.stringify(pData);
    },
 
    setValue: function (value) {
        this.panelValue.setValue(value);
 
        var pData = JSON.parse(value);
 
        this.items.each(function(i){
            if(i.xtype == "label" || i.xtype == "hidden" || !i.hasOwnProperty("dName")){
                return;
            }
 
            if(!pData[i.dName]){
                return;
            }
 
            i.setValue(pData[i.dName]);
        });
    },
 
    validate: function(){
        return true;
    },
 
    getName: function(){
        return this.name;
    }
});
 
CQ.Ext.reg("multipanel", ClientLib.MultiPanel);
CQ.form.CustomMultiFieldExtended = CQ.Ext.extend(CQ.form.CompositeField, {

hiddenField: null,
desc: null,
link: null,
icon: null,
type: null,
overwrite: null,

constructor: function(config) {
    config = config || { };
    var defaults = {
        "border": true,
        "layout": "form",
        "columns":4
    };
    config = CQ.Util.applyDefaults(config, defaults);
    CQ.form.CustomMultiFieldExtended.superclass.constructor.call(this, config);
},

// overriding CQ.Ext.Component#initComponent
initComponent: function() {
    CQ.form.CustomMultiFieldExtended.superclass.initComponent.call(this);

    this.hiddenField = new CQ.Ext.form.Hidden({
        name: this.name
    });
    this.add(this.hiddenField);

    this.type = new CQ.form.Selection({
        fieldLabel:"Feature Type",
        xtype: "selection",
        type:"select",
        options:[
            {value:"price",text:"Price Feature"},
            {value:"mpg",text:"MPG Feature"},
            {value:"add",text:"Additional Feature"}
        ],
        style: {float:'left'},
        hideLabel: false,
        width: "250",
        listeners: {
             input: {
                scope:this,
                fn:this.updateHidden
            }
        },
        optionsProvider: this.optionsProvider
    });
    this.add(this.type);

    this.desc = new CQ.Ext.form.TextField({
        fieldLabel:"Feature Desc",
        cls:"feature-desc",
        hideLabel: false,
        width: "250",
        style: {margin: '0 5px',float: 'left'},
        listeners: {
             change: {
                scope:this,
                fn:this.updateHidden
            }
        },
        optionsProvider: this.optionsProvider
    });
    this.add(this.desc);

    this.link = new CQ.form.PathField({
        fieldLabel:"Feature Link",
        cls:"feature-link",
        hideLabel: false,
        width: "250",
        style: {margin: '0 5px',float: 'left'},
        listeners: {
            dialogclose: {
                scope:this,
                fn:this.updateHidden
            },
            change: {
                scope:this,
                fn:this.updateHidden
            }
        }
    });
    this.add(this.link);

    this.icon = new CQ.form.PathField({
        fieldLabel:"Feature Icon",
        cls:"feature-icon",
        hideLabel: false,
        width: "250",
        style: {margin: '0 5px',float: 'left'},
        listeners: {
            dialogclose: {
                scope:this,
                fn:this.updateHidden
            }
        }
    });
    this.add(this.icon);

    this.overwrite = new CQ.Ext.form.TextField({
        fieldLabel:"Feature Overwrite",
        cls:"feature-overwrite",
        hideLabel: false,
        width: "250",
        style: {margin: '0 5px',float: 'left'},
        listeners: {
            change: {
                scope:this,
                fn:this.updateHidden
            }
        }
    });
    this.add(this.overwrite);


},


// overriding CQ.form.CompositeField#setValue
setValue: function(value) {
    var data = JSON.parse(value);
    this.overwrite.setValue(data.overwrite);
    this.icon.setValue(data.icon);
    this.desc.setValue(data.desc);
    this.link.setValue(data.link);
    this.type.setValue(data.type);
    this.hiddenField.setValue(JSON.stringify(data));
},

// overriding CQ.form.CompositeField#getValue
getValue: function() {
    return this.getRawValue();
},

// overriding CQ.form.CompositeField#getRawValue
getRawValue: function() {
    var jObj = new Object();
    jObj["overwrite"] = this.overwrite.getValue();
    jObj["icon"] = this.icon.getValue();
    jObj["desc"] = this.desc.getValue();
    jObj["link"] = this.link.getValue();
    jObj["type"] = this.type.getValue();
    return JSON.stringify(jObj);
},

// private
updateHidden: function() {
    this.hiddenField.setValue(this.getValue());
}
});

// register xtype
CQ.Ext.reg('customMultiFieldExtended', CQ.form.CustomMultiFieldExtended);
CQ.form.MastheadColumn = CQ.Ext.extend(CQ.form.CompositeField, {

    // variables
    hiddenField:null,
    toprow:null,
    bottomrow:null,
    //color:null,

    // methods
    constructor: function(config) {
        config = config || {};
        var defaults = {
            "border": true,
            "layout": "form"
        };
        config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.MastheadColumn.superclass.constructor.call(this, config);
    },

    // overriding CQ.Ext.Component#initComponent
    initComponent: function() {

        CQ.form.MastheadColumn.superclass.initComponent.call(this);

        // add the hidden field
        this.hiddenField = new CQ.Ext.form.Hidden({
            name: this.name
        });
        this.add(this.hiddenField);

        // add the text field for the top row
        this.toprow = new CQ.Ext.form.TextField({
            fieldLabel:"Top Row",
            hideLabel: false,
            listeners: {
                 change: {
                    scope:this,
                    fn:this.updateHidden
                }
            },
            optionsProvider: this.optionsProvider
        });
        this.add(this.toprow);

        // add the text field for the bottom row
        this.bottomrow = new CQ.Ext.form.TextField({
            fieldLabel:"Bottom Row",
            hideLabel: false,
            listeners: {
                 change: {
                    scope:this,
                    fn:this.updateHidden
                }
            },
            optionsProvider: this.optionsProvider
        });
        this.add(this.bottomrow);

        /*this.color = new CQ.form.Selection({
            fieldLabel:"Text Color",
            xtype: "selection",
            type:"select",
            options:[
                {value:"black",text:"Black"},
                {value:"white",text:"White"},
                {value:"blue",text:"Cadillac Blue"},
                {value:"gold",text:"Cadillac Gold"},
                {value:"red",text:"Cadillac Red"},
                {value:"light-gray",text:"Cadillac Light Gray"},
                {value:"gray",text:"Cadillac Gray"},
                {value:"dark-gray",text:"Cadillac Dark Gray"}
            ],
            hideLabel: false,
            listeners: {
                 change: {
                    scope:this,
                    fn:this.updateHidden
                }
            },
            optionsProvider: this.optionsProvider
        });
        this.add(this.color);*/

    },

    // overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
        var data = JSON.parse(value);
        this.toprow.setValue(data.toprow);
        this.bottomrow.setValue(data.bottomrow);
        //this.color.setValue(data.color);
        this.hiddenField.setValue(JSON.stringify(data));
    },

    // overriding CQ.form.CompositeField#getValue
    getValue: function() {
        return this.getRawValue();
    },

    // overriding CQ.form.CompositeField#getRawValue
    getRawValue: function() {
        var jObj = new Object();
        jObj["toprow"] = this.toprow.getValue();
        jObj["bottomrow"] = this.bottomrow.getValue();
        //jObj["color"] = this.color.getValue();
        return JSON.stringify(jObj);
    },

    // private
    updateHidden: function() {
        this.hiddenField.setValue(this.getValue());
    }

});

// register xtype
CQ.Ext.reg('mastheadColumn', CQ.form.MastheadColumn);
CQ.form.MastheadColumnWithVideo = CQ.Ext.extend(CQ.form.CompositeField, {

    // variables
    hiddenField:null,
    toprow:null,
    bottomrow:null,
    videoprovider:null,
    videoid:null,

    // methods
    constructor: function(config) {
        config = config || {};
        var defaults = {
            "border": true,
            "layout": "form"
        };
        config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.MastheadColumnWithVideo.superclass.constructor.call(this, config);
    },

    // overriding CQ.Ext.Component#initComponent
    initComponent: function() {

        CQ.form.MastheadColumnWithVideo.superclass.initComponent.call(this);

        // add the hidden field
        this.hiddenField = new CQ.Ext.form.Hidden({
            name: this.name
        });
        this.add(this.hiddenField);

        // add the text field for the top row
        this.toprow = new CQ.Ext.form.TextField({
            fieldLabel:"Top Row",
            hideLabel: false,
            listeners: {
                 change: {
                    scope:this,
                    fn:this.updateHidden
                }
            },
            optionsProvider: this.optionsProvider
        });
        this.add(this.toprow);

        // add the text field for the bottom row
        this.bottomrow = new CQ.Ext.form.TextField({
            fieldLabel:"Bottom Row",
            hideLabel: false,
            listeners: {
                 change: {
                    scope:this,
                    fn:this.updateHidden
                }
            },
            optionsProvider: this.optionsProvider
        });
        this.add(this.bottomrow);

        this.videoprovider = new CQ.form.Selection({
            fieldLabel:"Video Provider",
            xtype: "selection",
            type:"select",
            options:[
                {value:"Youtube",text:"Youtube"}
            ],
            hideLabel: false,
            listeners: {
                 change: {
                    scope:this,
                    fn:this.updateHidden
                }
            },
            optionsProvider: this.optionsProvider
        });
        this.add(this.videoprovider);

        // add the text field for the Video ID
        this.videoid = new CQ.Ext.form.TextField({
            fieldLabel:"Video ID",
            hideLabel: false,
            listeners: {
                 change: {
                    scope:this,
                    fn:this.updateHidden
                }
            },
            optionsProvider: this.optionsProvider
        });
        this.add(this.videoid);

    },

    // overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
        var data = JSON.parse(value);
        this.toprow.setValue(data.toprow);
        this.bottomrow.setValue(data.bottomrow);
        this.videoprovider.setValue(data.videoprovider);
        this.videoid.setValue(data.videoid);
        this.hiddenField.setValue(JSON.stringify(data));
    },

    // overriding CQ.form.CompositeField#getValue
    getValue: function() {
        return this.getRawValue();
    },

    // overriding CQ.form.CompositeField#getRawValue
    getRawValue: function() {
        var jObj = new Object();
        jObj["toprow"] = this.toprow.getValue();
        jObj["bottomrow"] = this.bottomrow.getValue();
        jObj["videoprovider"] = this.videoprovider.getValue();
        jObj["videoid"] = this.videoid.getValue();
        return JSON.stringify(jObj);
    },

    // private
    updateHidden: function() {
        this.hiddenField.setValue(this.getValue());
    }

});

// register xtype
CQ.Ext.reg('mastheadColumnWithVideo', CQ.form.MastheadColumnWithVideo);
CQ.form.TrimsMultifield = CQ.Ext.extend(CQ.form.CompositeField, {

    hiddenField: null,
    trimInfo: null,
    
    title: null,
    price: null,
    rpo: null,
    image: null,
    optLink: null,
    standard: null,
    available: null,
    noavail: null,
    byoDeepLink: "",


    constructor: function(config) {
        config = config || { };
        var defaults = {
            "border": true,
            "layout": "form",
            "columns":4
        };
        config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.TrimsMultifield.superclass.constructor.call(this, config);
    },

// overriding CQ.Ext.Component#initComponent
    initComponent: function() {
        CQ.form.TrimsMultifield.superclass.initComponent.call(this);

        this.hiddenField = new CQ.Ext.form.Hidden({
            name: this.name
        });
        this.add(this.hiddenField);

        this.trimInfo = new CQ.form.Selection({
            fieldLabel:"Trim",
            xtype: "selection",
            type:"select",
            allowBlank: false,
            options: this.getTrimsList(),
            style: {float:'left'},
            hideLabel: false,
            width: "350",
            listeners: {
                dialogclose: {
                    scope:this,
                    fn:this.updateHidden
                },
                input: {
                    scope:this,
                    fn:this.updateHidden
                },
                selectionchanged: {
                    scope:this,
                    fn:this.updateHidden
                }
            },
            optionsProvider: this.optionsProvider
        });

        this.add(this.trimInfo);

        /*this.desc = new CQ.form.Selection({
            fieldLabel:"Feature",
            xtype: "selection",
            type:"select",
            options: this.getFeaturesList(),
            style: {float:'left'},
            hideLabel: false,
            width: "200",
            listeners: {
                dialogclose: {
                    scope:this,
                    fn:this.updateHidden
                },
                input: {
                    scope:this,
                    fn:this.updateHidden
                }
            },
            optionsProvider: this.optionsProvider
        });
        this.add(this.desc);
        console.log(this.desc);*/

        this.title = new CQ.Ext.form.TextField({
            fieldLabel:"Trim Title Overwrite",
            cls:"trim-desc",
            hideLabel: false,
            width: "300",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                change: {
                    scope:this,
                    fn:this.updateHidden
                },
                dialogclose: {
                    scope:this,
                    fn:this.updateHidden
                }
            },
            optionsProvider: this.optionsProvider
        });
        this.add(this.title);

        this.price = new CQ.Ext.form.TextField({
            fieldLabel:"Price Overwrite",
            cls:"price-overwrite",
            hideLabel: false,
            width: "300",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        this.add(this.price);

        this.image = new CQ.form.PathField({
            fieldLabel:"Trim Icon Overwrite",
            cls:"trim-icon",
            hideLabel: false,
            width: "300",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                dialogclose: {
                    scope:this,
                    fn:this.updateHidden
                },
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        this.add(this.image);

 /*       this.link = new CQ.form.PathField({
            fieldLabel:"Trim Link",
            cls:"trim-link",
            hideLabel: false,
            width: "250",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                dialogclose: {
                    scope:this,
                    fn:this.updateHidden
                },
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        this.add(this.link);*/
        this.rpo = new CQ.Ext.form.TextField({
            fieldLabel:"Trim BYO RPO",
            fieldDescription: "Optional feature RPO code to append to BYO link (packages already have rpo code appended)",
            cls:"trim-link",
            hideLabel: false,
            width: "300",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                dialogclose: {
                    scope:this,
                    fn:this.updateHidden
                },
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        this.add(this.rpo);
        
        this.byoDeepLink = new CQ.form.Selection({
            fieldLabel:"BYO Link Section",
            cls:"trim-deeplink",
            width:"200",
            xtype: "selection",
            type: "select",
            options:[
                {text:"Configuration",value:"config"},
                {text:"Trims",value:"trim"},
                {text:"Colors",value:"color"},
                {text:"Packages",value:"packages"},
                {text:"Exterior",value:"exterior"},
                {text:"Interior",value:"interior"},
                {text:"Accessories",value:"accessories"},
                {text:"Summary",value:"summary"}
            ],
            listeners: {
                dialogclose: {
                    scope:this,
                    fn:this.updateHidden
                },
                change: {
                    scope:this,
                    fn:this.updateHidden
                },
                selectionchanged: {
                    scope:this,
                    fn:this.updateHidden
                }
            },
            optionsProvider: this.optionsProvider
        });
        this.add(this.byoDeepLink);

        this.optLink = new CQ.form.PathField({
            fieldLabel:"Link for Trim Name and Jellybean (Defaults to BYO)",
            cls:"trim-optlink",
            hideLabel: false,
            width: "300",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                dialogclose: {
                    scope:this,
                    fn:this.updateHidden
                },
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        this.add(this.optLink);



        this.standard = new CQ.Ext.form.TextField({
            fieldLabel:"Standard Features (CSV)",
            fieldDescription:"Comma separated list of feature RPO codes for standard features (overrides default availability of feature for this trim)",
            cls:"package-standard",
            hideLabel: false,
            width: "400",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        this.add(this.standard);

        this.available = new CQ.Ext.form.TextField({
            fieldLabel:"Available Features (CSV)",
            fieldDescription:"Comma separated list of feature RPO codes for available features (overrides default availability of feature for this trim)",
            cls:"package-available",
            hideLabel: false,
            width: "400",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        this.add(this.available);

        this.noavail = new CQ.Ext.form.TextField({
            fieldLabel:"N/A Features (CSV)",
            fieldDescription:"Comma separated list of feature RPO codes for N/A features (overrides default availability of feature for this trim)",
            cls:"package-noavail",
            hideLabel: false,
            width: "400",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        this.add(this.noavail);


    },


// overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
        var data = JSON.parse(value);
        this.trimInfo.setValue(data.trimInfo);
        this.price.setValue(data.price);
        this.image.setValue(data.image);
        this.title.setValue(data.title);
        this.rpo.setValue(data.rpo);
        this.optLink.setValue(data.optLink);
        this.available.setValue(data.available);
        this.standard.setValue(data.standard);
        this.noavail.setValue(data.noavail);
        this.byoDeepLink.setValue(data.byoDeepLink);

        this.hiddenField.setValue(JSON.stringify(data));
    },

// overriding CQ.form.CompositeField#getValue
    getValue: function() {
        return this.getRawValue();
    },

// overriding CQ.form.CompositeField#getRawValue
    getRawValue: function() {
        var jObj = new Object();
        jObj["trimInfo"] = this.trimInfo.getValue();
        jObj["price"] = this.price.getValue();
        jObj["image"] = this.image.getValue();
        jObj["title"] = this.title.getValue();
        jObj["rpo"] = this.rpo.getValue();
        jObj["optLink"] = this.optLink.getValue();
        jObj["standard"] = this.standard.getValue();
        jObj["available"] = this.available.getValue();
        jObj["noavail"] = this.noavail.getValue();
        jObj["byoDeepLink"] = this.byoDeepLink.getValue();

        return JSON.stringify(jObj);
    },

    getTrimsList: function() {
        var path = CQ.WCM.getPagePath();
        var trimOptions = {};
        mrm.$.ajax({
            async : false,
            url : path + '/jcr:content/get.trims-attr-list.json?trimmap',
            type : 'GET',
            cache : false,
            success: function(data) {
                trimOptions = data;
            }
        });
        var trimsList = [];
        for (var trimIndex =0; trimIndex < trimOptions.length; trimIndex++) {
            var trim = JSON.parse(trimOptions[trimIndex]);
            var text = trim.text;
            var value = trim.value;
            var jsonData = {};
            jsonData["text"] = text;
            jsonData["value"] = JSON.stringify(value);
            //jsonData["value"] = value;
            //console.log(value);
            trimsList.push(jsonData);
        }
        //console.log(trimsList);
        return trimsList;
    },
    getFeaturesList: function(){
        var path = CQ.WCM.getPagePath();
        var featureOptions = {};
        mrm.$.ajax({
            async : false,
            url : path + '/jcr:content/get.trims-attr-list.json?attr',
            type : 'GET',
            cache : false,
            success: function(data) {
                featureOptions = data;
            }
        });
        var featuresList = [];
        for (var featureIndex =0; featureIndex < featureOptions.length; featureIndex++) {
            var feature = JSON.parse(featureOptions[featureIndex]);
            var text = feature.text;
            var value = feature.value;
            var jsonData = {};
            jsonData["text"] = text;
            jsonData["value"] = JSON.stringify(value);
            //jsonData["value"] = value;
            //console.log(value);
            featuresList.push(jsonData);
        }
        //console.log(featuresList);
        return featuresList;
    },
    getTrimsOptions: function(){
        var path = CQ.WCM.getPagePath();
        //var parent = this.findParentByType('dialog').path;
        //console.log(parent +" :::::: "+path);
        var trimOptions = {};
        mrm.$.ajax({
            async : false,
            url : path + '/jcr:content/get.trims-attr-list.json?trims',
            type : 'GET',
            cache : false,
            success: function(data) {
                trimOptions = data;
            }
        });
        return trimOptions;
    },

// private
    updateHidden: function() {
        this.hiddenField.setValue(this.getValue());
    }
});

// register xtype
CQ.Ext.reg('trimsMultiField', CQ.form.TrimsMultifield);

CQ.form.CustomCategorizedOffers = CQ.Ext.extend(CQ.form.CompositeField, {
    hiddenField: null,
    carModelName: null,
    trimName: null,
    carImage: null,
    carLargeJelly: null,
    promoInfo: null,
    cta1Text: null,
    cta1Link: null,
    cta2Text: null,
    cta2Link: null,
    cta3Text: null,
    cta3Link: null,
    cta4Text: null,
    cta4Link: null,
    constructor: function(config) {
        console.log(config);
        config = config || { };
        var defaults = {
            "border": false,
            "layout": {
                type: 'form',
                border: '0px'
            },
            "border": 0,
            "columns": 2
        };
        config = CQ.Util.applyDefaults(config, defaults);
        this.configs = config;
        CQ.form.CustomCategorizedOffers.superclass.constructor.call(this, config);
    },

    initComponent: function() {
        CQ.form.CustomCategorizedOffers.superclass.initComponent.call(this);
        this.hiddenField = new CQ.Ext.form.Hidden({
            name : this.name
        });
        this.add(this.hiddenField);

    // car model name
    this.add(new CQ.Ext.form.Label({
        cls : "customwidget-label",
        text : "Choose the car model & trim",
        style : "font-size: 20px; font-weight: bold;"
    }));
    this.carModelName = new CQ.Ext.form.TextField({
                cls : "customwidget-1",
                fieldLabel : "Model Name:",
                allowBlank : false,
                width : 400,
                listeners : {
                    change : {
                        scope : this,
                        fn : this.updateHidden
                    }
                }
            });
    this.add(this.carModelName);

   // car trim name
    this.add(new CQ.Ext.form.Label({
        cls : "customwidget-label"
    }));
    this.trimName = new CQ.Ext.form.TextField({
                cls : "customwidget-1",
                fieldLabel : "Trim Name or Offer Type:",
                allowBlank : true,
                width : 400,
                listeners : {
                    change : {
                        scope : this,
                        fn : this.updateHidden
                    }
                }
            });
    this.add(this.trimName);


    // Car Thumbnail
    this.add(new CQ.Ext.form.Label({
        cls : "customwidget-label",
        text : "Select a thumbnail for this model"
    }));
    this.carImage = new CQ.form.PathField({
        cls : "customwidget-2",
        fieldLabel : "Image Path: ",
        allowBlank : true,
        width : 400,
        listeners : {
            change : {
                scope : this,
                fn : this.updateHidden
            },
            dialogclose : {
                scope : this,
                fn : this.updateHidden
            }
        }
    });
    this.add(this.carImage);

    // Car Large Jellybean image
    this.add(new CQ.Ext.form.Label({
        cls : "customwidget-label",
        text : "Select a large image for this model"
    }));
    this.carLargeJelly = new CQ.form.PathField({
        cls : "customwidget-2",
        fieldLabel : "Image Path: ",
        allowBlank : true,
        width : 400,
        listeners : {
            change : {
                scope : this,
                fn : this.updateHidden
            },
            dialogclose : {
                scope : this,
                fn : this.updateHidden
            }
        }
    });
    this.add(this.carLargeJelly);

    // Image of detail Promotion Information
    this.add(new CQ.Ext.form.Label({
        cls : "customwidget-label",
        text : "Promotion Information"
    }));
    this.promoInfo = new CQ.form.PathField({
        cls : "customwidget-2",
        fieldLabel : "Image Path: ",
        allowBlank : true,
        width : 400,
        listeners : {
            change : {
                scope : this,
                fn : this.updateHidden
            },
            dialogclose : {
                scope : this,
                fn : this.updateHidden
            }
        }
    });
    this.add(this.promoInfo);


     // CTA1 Text
    this.add(new CQ.Ext.form.Label({
        cls : "customwidget-label",
        text : "1st CTA Button"
    }));
    this.cta1Text = new CQ.Ext.form.TextField({
                cls : "customwidget-1",
                fieldLabel : "Text:",
                allowBlank : true,
                width : 400,
                listeners : {
                    change : {
                        scope : this,
                        fn : this.updateHidden
                    }
                }
            });
    this.add(this.cta1Text);

    // CTA1 Link
    this.add(new CQ.Ext.form.Label({
        cls : "customwidget-label",
    }));
    this.cta1Link = new CQ.form.PathField({
        cls : "customwidget-2",
        fieldLabel : "Link: ",
        allowBlank : true,
        width : 400,
        listeners : {
            change : {
                scope : this,
                fn : this.updateHidden
            },
            dialogclose : {
                scope : this,
                fn : this.updateHidden
            }
        }
    });
    this.add(this.cta1Link);

     // CTA2 Text
     this.add(new CQ.Ext.form.Label({
         cls : "customwidget-label",
         text : "2nd CTA Button"
     }));
     this.cta2Text = new CQ.Ext.form.TextField({
                 cls : "customwidget-1",
                 fieldLabel : "Text:",
                 allowBlank : true,
                 width : 400,
                 listeners : {
                     change : {
                         scope : this,
                         fn : this.updateHidden
                     }
                 }
             });
     this.add(this.cta2Text);

     // CTA2 Link
     this.add(new CQ.Ext.form.Label({
         cls : "customwidget-label",
     }));
     this.cta2Link = new CQ.form.PathField({
         cls : "customwidget-2",
         fieldLabel : "Link: ",
         allowBlank : true,
         width : 400,
         listeners : {
             change : {
                 scope : this,
                 fn : this.updateHidden
             },
             dialogclose : {
                 scope : this,
                 fn : this.updateHidden
             }
         }
     });
     this.add(this.cta2Link);

    // CTA3 Text
    this.add(new CQ.Ext.form.Label({
        cls : "customwidget-label",
        text : "3rd CTA Button"
    }));
    this.cta3Text = new CQ.Ext.form.TextField({
                cls : "customwidget-1",
                fieldLabel : "Text:",
                allowBlank : true,
                width : 400,
                listeners : {
                    change : {
                        scope : this,
                        fn : this.updateHidden
                    }
                }
            });
    this.add(this.cta3Text);

    // CTA3 Link
    this.add(new CQ.Ext.form.Label({
        cls : "customwidget-label",
    }));
    this.cta3Link = new CQ.form.PathField({
        cls : "customwidget-2",
        fieldLabel : "Link: ",
        allowBlank : true,
        width : 400,
        listeners : {
            change : {
                scope : this,
                fn : this.updateHidden
            },
            dialogclose : {
                scope : this,
                fn : this.updateHidden
            }
        }
    });
    this.add(this.cta3Link);

    // CTA4 Text
    this.add(new CQ.Ext.form.Label({
        cls : "customwidget-label",
        text : "4th CTA Button"
    }));
    this.cta4Text = new CQ.Ext.form.TextField({
                cls : "customwidget-1",
                fieldLabel : "Text:",
                allowBlank : true,
                width : 400,
                listeners : {
                    change : {
                        scope : this,
                        fn : this.updateHidden
                    }
                }
            });
    this.add(this.cta4Text);

    // CTA4 Link
    this.add(new CQ.Ext.form.Label({
        cls : "customwidget-label",
    }));
    this.cta4Link = new CQ.form.PathField({
        cls : "customwidget-2",
        fieldLabel : "Link: ",
        allowBlank : true,
        width : 400,
        listeners : {
            change : {
                scope : this,
                fn : this.updateHidden
            },
            dialogclose : {
                scope : this,
                fn : this.updateHidden
            }
        }
    });
    this.add(this.cta4Link);

    // CTA5 Text
        this.add(new CQ.Ext.form.Label({
            cls : "customwidget-label",
            text : "5th CTA Button"
        }));
        this.cta5Text = new CQ.Ext.form.TextField({
                    cls : "customwidget-1",
                    fieldLabel : "Text:",
                    allowBlank : true,
                    width : 400,
                    listeners : {
                        change : {
                            scope : this,
                            fn : this.updateHidden
                        }
                    }
                });
        this.add(this.cta5Text);

        // CTA5 Link
        this.add(new CQ.Ext.form.Label({
            cls : "customwidget-label",
        }));
        this.cta5Link = new CQ.form.PathField({
            cls : "customwidget-2",
            fieldLabel : "Link: ",
            allowBlank : true,
            width : 400,
            listeners : {
                change : {
                    scope : this,
                    fn : this.updateHidden
                },
                dialogclose : {
                    scope : this,
                    fn : this.updateHidden
                }
            }
        });
        this.add(this.cta5Link);

 // CTA6 Text
     this.add(new CQ.Ext.form.Label({
         cls : "customwidget-label",
         text : "6th CTA Button"
     }));
     this.cta6Text = new CQ.Ext.form.TextField({
                 cls : "customwidget-1",
                 fieldLabel : "Text:",
                 allowBlank : true,
                 width : 400,
                 listeners : {
                     change : {
                         scope : this,
                         fn : this.updateHidden
                     }
                 }
             });
     this.add(this.cta6Text);

     // CTA4 Link
     this.add(new CQ.Ext.form.Label({
         cls : "customwidget-label",
     }));
     this.cta6Link = new CQ.form.PathField({
         cls : "customwidget-2",
         fieldLabel : "Link: ",
         allowBlank : true,
         width : 400,
         listeners : {
             change : {
                 scope : this,
                 fn : this.updateHidden
             },
             dialogclose : {
                 scope : this,
                 fn : this.updateHidden
             }
         }
     });
     this.add(this.cta6Link);


  },

   processInit : function(path, record) {
        this.carModelName.processInit(path, record);
        this.trimName.processInit(path, record);
        this.carImage.processInit(path, record);
        this.carLargeJelly.processInit(path, record);
        this.promoInfo.processInit(path, record);
        this.cta1Text.processInit(path, record);
        this.cta1Link.processInit(path, record);
        this.cta2Text.processInit(path, record);
        this.cta2Link.processInit(path, record);
        this.cta3Text.processInit(path, record);
        this.cta3Link.processInit(path, record);
        this.cta4Text.processInit(path, record);
        this.cta4Link.processInit(path, record);
        this.cta5Text.processInit(path, record);
        this.cta5Link.processInit(path, record);
        this.cta6Text.processInit(path, record);
        this.cta6Link.processInit(path, record);
    },

    setValue : function(value) {
        var link = JSON.parse(value);
        this.carModelName.setValue(link.carModelName);
        this.trimName.setValue(link.trimName);
        this.carImage.setValue(link.carImage);
        this.carLargeJelly.setValue(link.carLargeJelly);
        this.promoInfo.setValue(link.promoInfo);
        this.cta1Text.setValue(link.cta1Text);
        this.cta1Link.setValue(link.cta1Link);
        this.cta2Text.setValue(link.cta2Text);
        this.cta2Link.setValue(link.cta2Link);
        this.cta3Text.setValue(link.cta3Text);
        this.cta3Link.setValue(link.cta3Link);
        this.cta4Text.setValue(link.cta4Text);
        this.cta4Link.setValue(link.cta4Link);
        this.cta5Text.setValue(link.cta5Text);
        this.cta5Link.setValue(link.cta5Link);
        this.cta6Text.setValue(link.cta6Text);
        this.cta6Link.setValue(link.cta6Link);
        this.hiddenField.setValue(value);
    },

    getValue : function() {
        return this.getRawValue();
    },

    getRawValue : function() {
        var link = {
            "carModelName" : this.carModelName.getValue(),
            "trimName" : this.trimName.getValue(),
            "carImage" : this.carImage.getValue(),
            "carLargeJelly" : this.carLargeJelly.getValue(),
            "promoInfo" : this.promoInfo.getValue(),
            "cta1Text" : this.cta1Text.getValue(),
            "cta1Link" : this.cta1Link.getValue(),
            "cta2Text" : this.cta2Text.getValue(),
            "cta2Link" : this.cta2Link.getValue(),
            "cta3Text" : this.cta3Text.getValue(),
            "cta3Link" : this.cta3Link.getValue(),
            "cta4Text" : this.cta4Text.getValue(),
            "cta4Link" : this.cta4Link.getValue(),
            "cta5Text" : this.cta5Text.getValue(),
            "cta5Link" : this.cta5Link.getValue(),
            "cta6Text" : this.cta6Text.getValue(),
            "cta6Link" : this.cta6Link.getValue()

       };
        return JSON.stringify(link);
    },



// private
    updateHidden: function() {
        this.hiddenField.setValue(this.getValue());
    }


});

CQ.Ext.reg('customCategorizedOffers', CQ.form.CustomCategorizedOffers );
/**
 * Created by NZWVR8 on 3/9/2017.
 */
CQ.form.FeaturesMultifield = CQ.Ext.extend(CQ.form.CompositeField, {

    hiddenField: null,
    feature: null,

    overwrite: null,
    //service: this.getService,

    constructor: function(config) {
        config = config || { };
        var defaults = {
            "border": true,
            "layout": "form",
            "columns":4
        };
        config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.FeaturesMultifield.superclass.constructor.call(this, config);
    },

// overriding CQ.Ext.Component#initComponent
    initComponent: function() {
        CQ.form.FeaturesMultifield.superclass.initComponent.call(this);

        this.hiddenField = new CQ.Ext.form.Hidden({
            name: this.name
        });
        this.add(this.hiddenField);


        this.feature = new CQ.form.Selection({
         fieldLabel:"Feature",
         xtype: "selection",
         allowBlank: false,
         type:"select",
         options: this.getFeaturesList(),
         style: {float:'left'},
         hideLabel: false,
         width: "400",
         listeners: {
            dialogclose: {
                scope:this,
                fn:this.updateHidden
            },
            input: {
                scope:this,
                fn:this.updateHidden
            },
             selectionchanged: {
                 scope:this,
                 fn:this.updateHidden
             }
         },
         optionsProvider: this.optionsProvider
         });
         this.add(this.feature);


        

        this.overwrite = new CQ.Ext.form.TextField({
            fieldLabel:"Feature Name Overwrite",
            cls:"feature-overwrite",
            hideLabel: false,
            width: "400",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        this.add(this.overwrite);


    },

    getService: function() {
        var path = CQ.WCM.getPagePath();

        mrm.$.ajax({
            async: false,
            url: path + '/jcr:content/get.trims-attr-list.json?service',
            type: 'GET',
            cache: false,
            success: function(data) {
                return data.url;
            }
        });

    },
// overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
        var data = JSON.parse(value);
        this.overwrite.setValue(data.overwrite);

        this.feature.setValue(data.feature);
        //this.service.setValue(data.service);

        this.hiddenField.setValue(JSON.stringify(data));
    },

// overriding CQ.form.CompositeField#getValue
    getValue: function() {
        return this.getRawValue();
    },

// overriding CQ.form.CompositeField#getRawValue
    getRawValue: function() {
        var jObj = new Object();
        jObj["overwrite"] = this.overwrite.getValue();

        jObj["feature"] = this.feature.getValue();
        //jObj["service"] = this.service.getValue();

        return JSON.stringify(jObj);
    },

    getTrimFeatures: function() {
        var path = CQ.WCM.getPagePath();
        var trimFeats = {};
        mrm.$.ajax({
            async: false,
            url: path + '/jcr:content/get.trims-attr-list.json?avail',
            type: 'GET',
            cache: false,
            success: function(data) {
                trimFeats = data;
            }
        });

        console.log(trimFeats[0]);
        return trimFeats[0];
    },

    getFeaturesList: function(){
        var path = CQ.WCM.getPagePath();
        var featureOptions = {};
        mrm.$.ajax({
            async : false,
            url : path + '/jcr:content/get.trims-attr-list.json?attr',
            type : 'GET',
            cache : false,
            success: function(data) {
                featureOptions = data;
            }
        });
        var featuresList = [];
        for (var featureIndex =0; featureIndex < featureOptions.length; featureIndex++) {
            var feature = JSON.parse(featureOptions[featureIndex]);
            var text = feature.text;
            var value = feature.value;
            var jsonData = {};
            jsonData["text"] = text;
            jsonData["value"] = JSON.stringify(value);
            //jsonData["value"] = value;
            //console.log(value);
            featuresList.push(jsonData);
        }
        //console.log(featuresList);
        return featuresList;
    },
    getTrimsOptions: function(){
        var path = CQ.WCM.getPagePath();
        //var parent = this.findParentByType('dialog').path;
        //console.log(parent +" :::::: "+path);
        var trimOptions = {};
        mrm.$.ajax({
            async : false,
            url : path + '/jcr:content/get.trims-attr-list.json?trims',
            type : 'GET',
            cache : false,
            success: function(data) {
                trimOptions = data;
            }
        });
        return trimOptions;
    },

// private
    updateHidden: function() {
        this.hiddenField.setValue(this.getValue());
    }
});

// register xtype
CQ.Ext.reg('featuresMultiField', CQ.form.FeaturesMultifield);

/**
 * Created by NZWVR8 on 3/21/2017.
 */

CQ.form.PackagesMultifield = CQ.Ext.extend(CQ.form.CompositeField, {

    hiddenField: null,
    package: null,

    overwrite: null,
    standard: null,
    available: null,
    noavail: null,
    image: null,
    name: null,
    optLink: null,


    constructor: function(config) {
        config = config || { };
        var defaults = {
            "border": true,
            "layout": "form",
            "columns":4
        };
        config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.PackagesMultifield.superclass.constructor.call(this, config);
    },

// overriding CQ.Ext.Component#initComponent
    initComponent: function() {
        CQ.form.PackagesMultifield.superclass.initComponent.call(this);

        this.hiddenField = new CQ.Ext.form.Hidden({
            name: this.name
        });
        this.add(this.hiddenField);


        this.package = new CQ.form.Selection({
            fieldLabel:"Package",
            xtype: "selection",
            type:"select",
            allowBlank: false,
            options: this.getPackagesList(),
            style: {float:'left'},
            hideLabel: false,
            width: "350",
            listeners: {
                dialogclose: {
                    scope:this,
                    fn:this.updateHidden
                },
                input: {
                    scope:this,
                    fn:this.updateHidden
                },
                selectionchanged: {
                    scope:this,
                    fn:this.updateHidden
                }
            },
            optionsProvider: this.optionsProvider
        });
        this.add(this.package);


        this.overwrite = new CQ.Ext.form.TextField({
            fieldLabel:"Package Price",
            cls:"package-overwrite",
            hideLabel: false,
            width: "300",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        this.add(this.overwrite);

        this.name = new CQ.Ext.form.TextField({
            fieldLabel:"Package Name",
            cls:"package-name",
            hideLabel: false,
            width: "300",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        this.add(this.name);

        this.image = new CQ.form.PathField({
            fieldLabel:"Package Image",
            cls:"package-image",
            hideLabel: false,
            width: "300",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                dialogclose: {
                    scope:this,
                    fn:this.updateHidden
                },
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        this.add(this.image);

        this.optLink = new CQ.form.PathField({
            fieldLabel:"Package Title Link (Defaults to BYO)",
            cls:"package-optlink",
            hideLabel: false,
            width: "300",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                dialogclose: {
                    scope:this,
                    fn:this.updateHidden
                },
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        this.add(this.optLink);

        this.standard = new CQ.Ext.form.TextField({
            fieldLabel:"Standard Features (CSV)",
            fieldDescription:"Comma separated list of feature RPO codes for standard features (if different from parent trim)",
            cls:"package-standard",
            hideLabel: false,
            width: "400",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        this.add(this.standard);

        this.available = new CQ.Ext.form.TextField({
            fieldLabel:"Available Features (CSV)",
            fieldDescription:"Comma separated list of feature RPO codes for available features (if different from parent trim)",
            cls:"package-available",
            hideLabel: false,
            width: "400",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        this.add(this.available);

        this.noavail = new CQ.Ext.form.TextField({
            fieldLabel:"N/A Features (CSV)",
            fieldDescription:"Comma separated list of feature RPO codes for N/A features (if different from parent trim)",
            cls:"package-noavail",
            hideLabel: false,
            width: "400",
            style: {margin: '0 5px',float: 'left'},
            listeners: {
                change: {
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });
        this.add(this.noavail);



    },


// overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
        var data = JSON.parse(value);
        this.overwrite.setValue(data.overwrite);
        this.optLink.setValue(data.optLink);
        this.package.setValue(data.package);
        this.available.setValue(data.available);
        this.standard.setValue(data.standard);
        this.noavail.setValue(data.noavail);
        this.image.setValue(data.image);
        this.name.setValue(data.name);

        this.hiddenField.setValue(JSON.stringify(data));
    },

// overriding CQ.form.CompositeField#getValue
    getValue: function() {
        return this.getRawValue();
    },

// overriding CQ.form.CompositeField#getRawValue
    getRawValue: function() {
        var jObj = new Object();
        jObj["overwrite"] = this.overwrite.getValue();

        jObj["package"] = this.package.getValue();
        jObj["standard"] = this.standard.getValue();
        jObj["available"] = this.available.getValue();
        jObj["noavail"] = this.noavail.getValue();
        jObj["image"] = this.image.getValue();
        jObj["name"] = this.name.getValue();
        jObj["optLink"] = this.optLink.getValue();

        return JSON.stringify(jObj);
    },



    getPackagesList: function(){
        var path = CQ.WCM.getPagePath();
        var packageOptions = {};
        mrm.$.ajax({
            async : false,
            url : path + '/jcr:content/get.trims-attr-list.json?packages',
            type : 'GET',
            cache : false,
            success: function(data) {
                packageOptions = data;
            }
        });
        var packagesList = [];
        for (var packageIndex =0; packageIndex < packageOptions.length; packageIndex++) {
            var package = JSON.parse(packageOptions[packageIndex]);
            var text = package.text;
            var value = package.value;
            var jsonData = {};
            jsonData["text"] = text;
            jsonData["value"] = JSON.stringify(value);
            //jsonData["value"] = value;
            //console.log(value);
            packagesList.push(jsonData);
        }
        //console.log(featuresList);
        return packagesList;
    },


// private
    updateHidden: function() {
        this.hiddenField.setValue(this.getValue());
    }
});

// register xtype
CQ.Ext.reg('packagesMultiField', CQ.form.PackagesMultifield);

