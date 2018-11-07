/**
 * @class CQ.form.rte.commands.ExtendedLink
 * @extends CQ.form.rte.commands.Command
 * @private
 */
CQ.form.rte.commands.FfeExtendedLink = CQ.Ext.extend(CQ.form.rte.commands.Command,{
    
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
CQ.form.rte.commands.CommandRegistry.register("ffe_extendedlink", CQ.form.rte.commands.FfeExtendedLink);


/**
 * @class CQ.form.rte.plugins.FfeExtendedLinkPlugin
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
CQ.form.rte.plugins.FfeExtendedLinkPlugin = CQ.Ext.extend(CQ.form.rte.plugins.Plugin, {

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
            var editorKernel = this.editorKernel;
            var defaultConfig = {
                "jcr:primaryType" : "cq:Dialog",
                "title" : CQ.I18n.getMessage("Hyperlink"),
                "modal" : true,
                "width" : 500,
                "height" : 320, 
                "xtype" : "dialog", 
                "buttons" : CQ.Dialog.OKCANCEL, 
                "resetValues" : function() { 
                    this.getField("./internallink").setValue("");
                    this.getField("./externallink").setValue("");
                    this.getField("./linkTitle").setValue("");
                },
                "setLink" : function(a) { 
                    this.getField("./internallink").setValue(a.dom.getAttribute('internallink'));
                    this.getField("./externallink").setValue(a.dom.getAttribute('externallink'));
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
                            "internallink" : this.linkDialog.getField("./internallink").getValue(),
                            "externallink" : this.linkDialog.getField("./externallink").getValue() 
                        }
                    });
                }.createDelegate(this),
                "items" : {
                    "jcr:primaryType" : "cq:TabPanel",
                    "xtype" : "tabpanel",
                    "title" : "link",
                    "items" : {
                        "jcr:primaryType" : "cq:WidgetCollection",
                        "imagelinktab" : {
                            "jcr:primaryType" : "cq:Widget",
                            "title" : "Link",
                            "xtype" : "panel",
                            "items" : {
                                "jcr:primaryType" : "cq:WidgetCollection",
                                "linkTitle" : {
                                    "jcr:primaryType" : "cq:Widget",
                                    "fieldDescription" : "Enter an alternative link title here to add information about the nature of a link. Link titles will be shown in a tooltip.",
                                    "fieldLabel" : "Link Title",
                                    "name" : "./linkTitle",
                                    "xtype" : "textfield"
                                },
                                "internallink" : {
                                    "jcr:primaryType" : "cq:Widget",
                                    "fieldLabel" : "Internal Link",
                                    "name" : "./internallink",
                                    "xtype" : "browsefield"
                                },
                                "externallink" : {
                                    "jcr:primaryType" : "cq:Widget",
                                    "fieldDescription" : "External links can only be inserted from the External Link Library.",
                                    "fieldLabel" : "External Link",
                                    "name" : "./externallink",
                                    "xtype" : "browsefield"
                                }
                            }
                        }
                    }
                } 
            };
            if (!this.linkDialogConfig) {
                this.linkDialogConfig = {};
            }
            CQ.Util.applyDefaults(this.linkDialogConfig,defaultConfig);
            this.linkDialog = new CQ.Util.build(this.linkDialogConfig);
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
CQ.form.rte.plugins.PluginRegistry.register("ffe_extendedlinks", CQ.form.rte.plugins.FfeExtendedLinkPlugin);

//set max component list in sidekick to 15 instead of 4
CQ.wcm.ComponentList.MAX_GROUPS = 15;


//function to provide additional functionality for dom operations
(function() {
	var ffeDOMHelper = new FfeDOMHelper();
	window.ffeDOMHelper = function() {
		return ffeDOMHelper;
	};
})();

function FfeDOMHelper() {
	
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
	 * @param if true, widget is displayed, if false, widget is hidden
	 */
	this.setVisible = function(id, visible) {
		if (id) {
			var elt = CQ.Ext.get(id); 
			if (elt) { 
				if (visible) {
					elt.removeClass('x-hide-display');
					elt.setStyle('display', 'block');
					var widget = CQ.Ext.getCmp(id);
					setDisabled
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
	
	this.setDisable = function(id, disable) {
		if (id) {
			var elt = CQ.Ext.get(id); 
			if (elt) { 
				var widget = CQ.Ext.getCmp(id);
				if (disable) {
					widget.setDisabled(true);
				} else {
					widget.setDisabled(false);
				}
			}
		}
	};
	
	
	this.setFieldsetDisable = function(id, disable) {
		//set fieldset with all textfields disabled, is necessary if the textfields are mandatory
		if (id) {
			var elt = CQ.Ext.get(id); 
			if (elt) { 
				var widget = CQ.Ext.getCmp(id);
				if (disable) {
					widget.setDisabled(true);
					for (var i = 0; i < widget.items.items.length; i++) {
						var fItem = widget.items.items[i];
						if(fItem.xtype == "textfield"){
							fItem.setDisabled(true);
						}
					}
					
				} else {
					
					for (var i = 0; i < widget.items.items.length; i++) {
						var fItem = widget.items.items[i];
						if(fItem.xtype == "textfield"){
							fItem.setDisabled(false);
						}
					}
					widget.setDisabled(false);
				}
			}
		}
	};
	
	this.setFieldsetDisableDependsOnValue = function(id, disable, valuesWithoutDependecy, valuesShouldEnabled, valueDependsIfEnabled) {
		//if the textfield visibility depends on an other checkbox value use: valuesWithoutDependecy = values without dependencied, 
		//valuesShouldEnabled = textfields in the fieldset with checkbox dependencies, valueDependsIfEnabled = checkbox value that needs to be unchecked.
		//valuesShouldEnabled and valueDependsIfEnabled array needs the dependend values on the same array position.
		if (id) {
			var elt = CQ.Ext.get(id); 
			if (elt) { 
				var widget = CQ.Ext.getCmp(id);
				if (disable) {
					widget.setDisabled(true);
					for (var i = 0; i < widget.items.items.length; i++) {
						var fItem = widget.items.items[i];
						if(fItem.xtype == "textfield"){
							fItem.setDisabled(true);
						}
					}
				} else {
					for (var i = 0; i < widget.items.items.length; i++) {
						var fItem = widget.items.items[i];
						if(fItem.xtype == "selection"){
								 for(var j=0; j<valueDependsIfEnabled.length; j++) {
									 var dependsValue = valueDependsIfEnabled[j];
									 if((fItem.name == dependsValue) && (fItem.value != "true")){
										 valuesWithoutDependecy.push(valuesShouldEnabled[j]);
									 }
								 }
						}
					}
					for (var k = 0; k < widget.items.items.length; k++) {
						var fItem = widget.items.items[k];
						var isInValuesArray = jQuery.inArray(fItem.name, valuesWithoutDependecy);
						if(isInValuesArray > -1){
							fItem.setDisabled(false);
						}
					}
					widget.setDisabled(false);
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
	 * @param if true, widget is displayed, if false, widget is hidden
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
	
	this.setDisableByClass = function(cls, parent, disable) {
		var nodes = this._getNodesByClass(cls, parent);						
		for (var i=0; i<nodes.length; i++) {			
			var node = nodes[i];		
			if(jQuery(node).parent().hasClass('x-html-editor-wrap')){
				node = node.parentNode.parentNode.parentNode;
			}
			this.setDisable(node.id, disable);
		}		
	};
	
	this.setFieldsetDisableByClass = function(cls, parent, disable) {
		var nodes = this._getNodesByClass(cls, parent);						
		for (var i=0; i<nodes.length; i++) {			
			var node = nodes[i];		
			if(jQuery(node).parent().hasClass('x-html-editor-wrap')){
				node = node.parentNode.parentNode.parentNode;
			}
			this.setFieldsetDisable(node.id, disable);
		}		
	};
	
	
	this.setFieldsetDisableByClassDependsOnValue = function(cls, parent, disable, valuesWithoutDependecy, valuesShouldEnabled, valueDependsIfEnabled) {
		var nodes = this._getNodesByClass(cls, parent);						
		for (var i=0; i<nodes.length; i++) {			
			var node = nodes[i];		
			if(jQuery(node).parent().hasClass('x-html-editor-wrap')){
				node = node.parentNode.parentNode.parentNode;
			}
			this.setFieldsetDisableDependsOnValue(node.id, disable, valuesWithoutDependecy, valuesShouldEnabled, valueDependsIfEnabled);
		}		
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
	
}

//function to switch the widget availability from enable to disable for groupcomponents.
(function() {
	var groupComponentProperties = new GroupComponentProperties();
	window.groupComponentProperties = function() {
		return groupComponentProperties;
	};
})();

function GroupComponentProperties() {
	
	this.enableDisableWidget = function(widget, path) {
		var disabled = jQuery.ajax({async:false, url: '/bin/ffe/groupcomponent.json?path='+path, type:'GET', cache :false}).responseText;
		if(disabled == 'true'){
			widget.setDisabled(true);
		}
	};
	
}

//function to switch the widget availability from enable to disable.
(function() {
	var enumComponentProperties = new EnumComponentProperties();
	window.enumComponentProperties = function() {
		return enumComponentProperties;
	};
})();

function EnumComponentProperties() {
	
	this.enableDisableWidget = function(widget, path) {
		var enabled = jQuery.ajax({async:false, url: '/bin/ffe/enumeration.json?path=' + path + '&checkDaterangeAvailability=true', type:'GET', cache :false}).responseText;
		if(enabled == 'false'){
			widget.ownerCt.hide();
		}else{
			widget.ownerCt.show();
		}
	};
	
}



//function to requests the variants for this form
(function() {
	var formVariantProperties = new FormVariantProperties();
	window.formVariantProperties = function() {
		return formVariantProperties;
	};
})();

function FormVariantProperties() {
	
	this.getVriantDownloadPropertyJson = function(widget, path) {
		widget.setOptions(eval(jQuery.ajax({async:false, url: '/bin/ffe/formvariantpageproperties.json?path=' + escape(path), type:'GET', cache :false}).responseText));
	};
	
}

// Function to request the properties of the component step
(function() {
	var formCompositionCompStepProperties = new FormCompositionCompStepProperties();
	window.formCompositionCompStepProperties = function() {
		return formCompositionCompStepProperties;
	};
})();

function FormCompositionCompStepProperties() {	
	this.getFormCompositionCompStepPropertiesJson = function(widget, path) {
		return (eval(jQuery.ajax({async:false, url: '/bin/ffe/fccs_properties.json?path=' + escape(path), type:'GET', cache :false}).responseText));
	};	
}

// Function to request the properties of the component thankyoupage
(function() {
	var formCompositionThankYouPageProperties = new FormCompositionThankYouPageProperties();
	window.formCompositionThankYouPageProperties = function() {
		return formCompositionThankYouPageProperties;
	};
})();

function FormCompositionThankYouPageProperties() {	
	this.getFormCompositionThankYouPagePropertiesJson = function(widget, path) {
		return (eval(jQuery.ajax({async:false, url: '/bin/ffe/fctyp_properties.json?path=' + escape(path), type:'GET', cache :false}).responseText));
	};	
}

//Function to request the properties of the component error page
(function() {
	var formCompositionErrorPageProperties = new FormCompositionErrorPageProperties();
	window.formCompositionErrorPageProperties = function() {
		return formCompositionErrorPageProperties;
	};
})();

function FormCompositionErrorPageProperties() {	
	this.getFormCompositionErrorPagePropertiesJson = function(widget, path) {
		return (eval(jQuery.ajax({async:false, url: '/bin/ffe/fcep_properties.json?path=' + escape(path), type:'GET', cache :false}).responseText));
	};	
}

//function to requests the pageproperties of the form template
(function() {
	var formPageProperties = new FormPageProperties();
	window.formPageProperties = function() {
		return formPageProperties;
	};
})();

function FormPageProperties() {
	
	this.getPagePropertyJson = function(widget, path, template, attrConstrain) {
		widget.setOptions(eval(jQuery.ajax({async:false, url: '/bin/ffe/formpageproperties.json?path=' + escape(path) + '&template=' + template + '&attrConstrain=' + escape(attrConstrain), type:'GET', cache :false}).responseText));
	};
	
}

// function used to render calendar into panel of a dialog
(function() {
	var enumerationValueDialog = new EnumerationValueDialog();
	window.enumerationValueDialog = function () {
		return enumerationValueDialog;
	};
})();

function EnumerationValueDialog() {
	var arr = [], loaded = false;
	var thePanel;
	
	/*
	 * clears the whole panel from its html.
	 */
	var reset = function() {
		var node = CQ.Ext.DomQuery.selectNode('#enum_dialog');
		if (typeof node !== 'undefined') {
			node.parentNode.innerHTML = "";
		}
	};
	
	/*
	 * Load the HTML from the onload_content.jspf via AJAX.
	 */
	var populate = function(panel) {
		// first load the placeholder (loading symbol)
		panel.body.update("<div style='line-height:250%; text-align:center;'><br />... loading ...</div>");
		// then send the ajax request to get the html to put in the dialog
		CQ.Ext.Ajax.request({
			url		: getPathForPanel(panel) + '.dialog_enum_collection.html',
			success	: function(response, opts) {
				panel.body.update(response.responseText);
				init();
			},
			failure: function(response, opts) {
			}
		});
	};
	
	/*
	 * Collect the data from the rows and send them to the server.
	 */
	var sendElementData = function(){
		var tableRows = CQ.Ext.DomQuery.select('#ffe_enum_table .enum_dialog_element');
		var data = '';
		CQ.Ext.each(tableRows, function(element){
			var row = CQ.Ext.get(element);
			var labelVal = row.child('.labelValue').getValue();
			var optionCode = row.child('.option_code').getValue();
			var orderNumber = row.child('.enum_order_number').getValue();
			
			var isCheckbox;
			var preselectData = ",,none"
			var firstRowPreselectCheckboxElement = row.child('.preselectCheckbox',true); 
			if(firstRowPreselectCheckboxElement) {
				isCheckbox= true;
				preselectData = ',,'+firstRowPreselectCheckboxElement.checked;
			}
			
			data = data + optionCode + ',,' + labelVal + ',,'+ orderNumber + preselectData + ';';
		});
		
		jQuery.ajax({async:false, type:'POST', url:getPathForPanel(window.enumerationValueDialog().thePanel) + '.extapp.html', data:{tableData:encodeURIComponent(data)}, cache:false});
		
	};

	/*
	 * This function removes a child node (i.e. a button) with the given 
	 * CSS class from the given parent element (i.e. a row) 
	 */
	var removeButtonFromRow = function(row,buttonClass){
		var button = CQ.Ext.get(row).child(buttonClass,true);
		if(button) {
			CQ.Ext.removeNode(button);
		}
	};
	
	/*
	 * Reset the up and down arrows AND the ordernumber.
	 */
	var resetUpDownArrows = function(){
		var tableRows = CQ.Ext.DomQuery.select('#ffe_enum_table .enum_dialog_element');
		if(!tableRows) {
			//no rows given, nothing to do!
			return;
		}
		var upButton = "<input type='button' class='enum_buttonup x-btn-text' value='up' name='up'/>";
		var downButton = "<input type='button' class='enum_buttondown x-btn-text' value='down' name='down'/>";
		//css class for the upbutton: x-tool x-tool-toggle
		//down button x-tool x-tool-toggle x-panel-collapsed
		
		for(var i=0;i<=tableRows.length-1;i++) {
			var currentRow = tableRows[i];
			CQ.Ext.get(currentRow).child('.enum_order_number',true).value = i;
			var currentRowDom = CQ.Ext.get(currentRow);
			removeButtonFromRow(currentRow,'.enum_buttonup');
			removeButtonFromRow(currentRow,'.enum_buttondown');
			if(i == 0) {
				currentRowDom.child('.buttonTd',true).innerHTML = downButton;
				continue;
			}
			if(i == tableRows.length-1) {
					currentRowDom.child('.buttonTd',true).innerHTML = upButton;
				continue;
			}
			currentRowDom.child('.buttonTd',true).innerHTML =  upButton + downButton;
		}
		registerUpAndDownButtons();
	};
	
	/*
	 * Register the switch rows event to the up and down buttons
	 * and reset the buttons (first row does not contain an up button)
	 */
	var registerUpAndDownButtons = function(){
		var tableRows = CQ.Ext.DomQuery.select('#ffe_enum_table .enum_dialog_element');
		CQ.Ext.each(tableRows, function(element){
			var currentRow = CQ.Ext.get(element);
			var previousRow = currentRow.prev('tr');
			var nextRow = currentRow.next('tr');
			var upArrow = currentRow.child('.enum_buttonup');
			var downArrow = currentRow.child('.enum_buttondown');
			
			if(upArrow) {
				upArrow.on('click', function() {
					switchRow(currentRow, 'up');
					resetUpDownArrows();
					return false;
				});
			}
			if(downArrow) {
				downArrow.on('click', function() {
					switchRow(currentRow, 'down');
					resetUpDownArrows();
					return false;
				});
			}
			
		});
	};
	
	/**
	 * This function sets label input fields to disabled (on init) if the inherit-checkbox is checked.
	 * It then registers an event handler to all checkbox to disable or enable the inputfield
	 * 
	 * @param tableRows list or array of tablerows (TRs) 
	 * @return
	 */
	var registerCheckboxToggle = function(){
		var tableRows = CQ.Ext.DomQuery.select('.enum_dialog_element');
		var labelInputCssClassEnabled = 'labelValue x-form-text x-form-field';
		var labelInputCssClassDisabled = 'x-item-disabled labelValue x-form-text x-form-field';
		CQ.Ext.each(tableRows, function(element){
			var currentRow = CQ.Ext.get(element);
			var labelFieldDomElement = currentRow.child('.labelValue',true);
			var labelFieldExtElement = currentRow.child('.labelValue');
		});
	};
	
	/**
	 * Switch the contents of two rows. the complete innerHTML will be switched and
	 * changes in browser (like text values, checkboxes etc.) is handled separately.
	 * 
	 * @param rowToMove a Ext.JS Element
	 * @param direction a string for the direction 'up' or 'down'
	 * @return
	 */
	var switchRow = function(rowToMove, direction){
		var rowId = rowToMove.dom.getAttribute('id');
		var row = jQuery('#'+rowId);
		var otherRow;
		if(direction == 'up') {
			otherRow = row.prev();
		}else {
			otherRow = row.next();
		}
		if(direction == 'up') {
			row.insertBefore(otherRow);
		}else {
			row.insertAfter(otherRow);
		}
	}
	
	
	/*
	 * Init the script. 
	 */
	var init = function() {
		registerUpAndDownButtons();
		registerCheckboxToggle();
		
		var okButton = CQ.Ext.DomQuery.select('table.cq-btn-ok');
		if(okButton) {
			okButton = CQ.Ext.get(okButton);
			okButton.on('click', function() {
				sendElementData();
				return true;
			});
		}
	};
	
	// public
	this.load = function(panel) {
		this.thePanel = panel;
		// bind once on render of dialog
		dialog = panel.findParentByType('dialog');
		dialog.on('loadContent', function() {
			reset();
			populate(panel);
			init();
		});
	}
}

//function used to render calendar into panel of a dialog
(function() {
	var includedInGroupDialog = new IncludedInGroupDialog();
	window.includedInGroupDialog = function () {
		return includedInGroupDialog;
	};
})();

function IncludedInGroupDialog() {
	
	this.loadDialogIncludePath = function(panel) {
		var parentDialog = panel.findParentByType('dialog');
		var parentDialogPath = parentDialog.initialConfig.responseScope.path;
		var isInGroup = mrm.$.ajax({async:false, url: '/bin/ffe/component_embedding?path='+parentDialogPath, type:'GET', cache :false}).responseText;
		if(isInGroup=="true"){
			panel.setDisabled(false)
		}
	}
	
	
}


//function used to render calendar into panel of a dialog
(function() {
	var newsletterValueDialog = new NewsletterValueDialog();
	window.newsletterValueDialog = function () {
		return newsletterValueDialog;
	};
})();

function NewsletterValueDialog() {
	
	var arr = [], loaded = false;
	var thePanel;
	
	// public
	this.load = function(panel) {
		this.thePanel = panel;
		// bind once on render of dialog
		dialog = panel.findParentByType('dialog');
		dialog.on('loadContent', function() {
			reset();
			populate(panel);
			init();
		});
	};
	
	/*
	 * clears the whole panel from its html.
	 */
	var reset = function() {
		var node = CQ.Ext.DomQuery.selectNode('#newsletter_dialog');
		if (typeof node !== 'undefined') {
			node.parentNode.innerHTML = "";
		}
	};
	

	/*
	 * Load the HTML from the onload_content.jspf via AJAX.
	 */
	var populate = function(panel) {
		// first load the placeholder (loading symbol)
		panel.body.update("<div style='line-height:250%; text-align:center;'><br />... loading ...</div>");
		// then send the ajax request to get the html to put in the dialog
		CQ.Ext.Ajax.request({
			url		: getPathForPanel(panel) + '.dialog_newsletter_collection.html',
			success	: function(response, opts) {
				panel.body.update(response.responseText);
				init();
			},
			failure: function(response, opts) {
			}
		});
	};

	/*
	 * Init the script. 
	 */
	var init = function() {
		var okButton = CQ.Ext.DomQuery.select('table.cq-btn-ok');
		if(okButton) {
			okButton = CQ.Ext.get(okButton);
			okButton.on('click', function() {
				sendElementData();
				return true;
			});
		}
	};
	
/*
 * Collect the data from the rows and send them to the server.
 */
var sendElementData = function(){
	var tableRows = CQ.Ext.DomQuery.select('.newsletter_dialog_element');
	var data = '';
	CQ.Ext.each(tableRows, function(element){
		var row = CQ.Ext.get(element);
		var labelValue = row.child('.labelValue').getValue();
		var code = row.child('.selectedId').getValue();
		
		var isCheckbox;
		var selectData = "false";
		var selectedId = row.child('.selectedId',true);
		if(selectedId) {
			isCheckbox= true;
			selectData = selectedId.checked;
		}
		
		data = data + code + ',,' + labelValue  + ',,' + selectData + ';';
	});
	
	jQuery.ajax({async:false, type:'POST', url:getPathForPanel(window.newsletterValueDialog().thePanel) + '.extapp.html', data:{tableData:encodeURIComponent(data)}, cache:false});
	
};
}


// function to requests the pageproperties of the form template
(function() {
	var masterformPageProperties = new MasterformPageProperties();
	window.masterformPageProperties = function() {
		return masterformPageProperties;
	};
})();

function MasterformPageProperties() {	
	var textfield;
	var myWidget;
	
	this.getRequestTypesJson = function(widget) {
		this.myWidget = widget;
		widget.setOptions(eval(jQuery.ajax({async:false, url: '/bin/ffe/masterformpageproperties.json', type:'GET', cache :false}).responseText));
	};
	
	this.setOptionsToMyWidget = function(json){
		this.myWidget.setOptions(eval(json));
	};
	
	this.setLanguagePage = function(widget) {
		this.textfield = widget;
//		var ajaxCon = jQuery.ajax({async:false, url: '/bin/masterformpageproperties.json?showLanguagePage=true', type:'GET', cache :false}).responseText;
//		var response = ajaxCon.responseText;
		widget.setRawValue(jQuery.ajax({async:false, url: '/bin/ffe/masterformpageproperties.json?showLanguagePage=true', type:'GET', cache :false}).responseText);
	};
}

//function to switch the widget availability from enable to disable.
(function() {
	var switchFieldsetAvailability = new SwitchFieldsetAvailability();
	window.switchFieldsetAvailability = function() {
		return switchFieldsetAvailability;
	};
})();

function SwitchFieldsetAvailability() {	
	
	this.switchFieldsetEnable= function(widget, value, fieldsetNamesToEnable, fieldsetNamesToDisable, valuesWhichWillCauseEnable){
		
		if(value == valuesWhichWillCauseEnable){
			var fieldsets =  widget.findParentByType('panel').items.items;
				for (var i = 0; i < fieldsets.length; i++) {
					var fItem = fieldsets[i];
						if (jQuery.inArray(fItem.title, fieldsetNamesToEnable) > -1) { 
							fItem.enable();
						}else if(jQuery.inArray(fItem.title, fieldsetNamesToDisable) > -1){
							fItem.disable();
							fItem.cascade(function(){this.setDisabled(true)});
						}
				}			
		}
	}
	
	this.switchFieldsetWithValuesEnable= function(widget, value, fieldsetNamesToEnable, fieldsetNamesToDisable, valuesWhichWillCauseEnable){
		
		if(value == valuesWhichWillCauseEnable){
			var fieldsets =  widget.findParentByType('panel').items.items;
				for (var i = 0; i < fieldsets.length; i++) {
					var fItem = fieldsets[i];
						if (jQuery.inArray(fItem.title, fieldsetNamesToEnable) > -1) { 
							fItem.enable();
						
							//set items in fieldset also as enable
							for (var j = 0; j < fItem.items.items.length; j++) {
								var item = fItem.items.items[j];
								if(item.xtype == "textfield"){
									item.setDisabled(false);
								}
							}
							
						}else if(jQuery.inArray(fItem.title, fieldsetNamesToDisable) > -1){
							fItem.disable();
							//set items in fieldset also as disable
							for (var k = 0; k < fItem.items.items.length; k++) {
								var item = fItem.items.items[k];
								if(item.xtype == "textfield"){
									item.setDisabled(true);
								}
							}
						}
				}			
		}
	}
}




// function to switch the widget availability from enable to disable.
(function() {
	var switchWidgetAvailability = new SwitchWidgetAvailability();
	window.switchWidgetAvailability = function() {
		return switchWidgetAvailability;
	};
})();



function SwitchWidgetAvailability() {	
	
		this.getNecessaryEnable= function(widget, firstItemNamesToDisable, firstValuesWhichWillCauseDisable, secondItemNamesToDisable, secondValuesWhichWillCauseDisable){
			var panel = widget.findParentByType('panel');
			
			var disableSecondFormElement = false;
			var disableStringValue = false;
			
			var isInFirstValuesWhichWillCauseDisableArray = jQuery.inArray(widget.value, firstValuesWhichWillCauseDisable);
			if(isInFirstValuesWhichWillCauseDisableArray > -1){
				disableSecondFormElement = true;
			}
			var isInSecondValuesWhichWillCauseDisableArray = jQuery.inArray(widget.value, secondValuesWhichWillCauseDisable);
			if(isInSecondValuesWhichWillCauseDisableArray > -1){
				disableStringValue = true;
			}
			
			var fieldsets =  widget.findParentByType('panel').items.items;
			for (var i = 0; i < fieldsets.length; i++) {
				var fItem = fieldsets[i];
					for (var j = 0; j < fItem.items.items.length; j++) {
								var item = fItem.items.items[j];
						if(disableSecondFormElement){
							if (item.name == firstItemNamesToDisable) { 
								item.setDisabled(true);
							}
						}
						if(disableStringValue){
							if (item.name == secondItemNamesToDisable) {
								item.setDisabled(true);
							}
						}
					}  
			}
				
		
		};
		
		this.enOrDisableWidget = function(widget, enable, itemNamesToDisable){
			
			if (jQuery.inArray(widget.name, itemNamesToDisable) > -1){
				if (enable) {
					widget.setDisabled(false);
				} else {
					widget.setDisabled(true);
				}
			}
		};
	
		this.switchEnableIfNecessary= function(widget, value, itemNamesToDisable, valuesWhichWillCauseDisable){
			var enable = false;
			var isInArray = jQuery.inArray(value, valuesWhichWillCauseDisable);
			if(isInArray > -1){
				enable = true;
			}
			var fieldsets =  widget.findParentByType('panel').items.items;
			for (var i = 0; i < fieldsets.length; i++) {
				var fItem = fieldsets[i];
				if(fItem.xtype == 'dialogfieldset'){
				
					for (var j = 0; j < fItem.items.items.length; j++) {
							var item = fItem.items.items[j];
							if(item.xtype == 'dialogfieldset'){
								for (var k = 0; k < item.items.items.length; k++) {
									var innerItem = item.items.items[k];
									this.enOrDisableWidget(innerItem,enable,itemNamesToDisable);
								}
							}else{
								this.enOrDisableWidget(item,enable,itemNamesToDisable);
							}
					}
				}else{
					//check if the item is not a fieldset and try to disable it if necessary
					this.enOrDisableWidget(fItem,enable,itemNamesToDisable);
					continue;
				} 
			}			
		};
		
		
		this.switchCheckboxIfNecessary = function(widget, value, itemNamesToDisable, valuesWhichWillCauseDisable){
			var disable = false;
			var isInArray = jQuery.inArray(value, valuesWhichWillCauseDisable);
			if(isInArray > -1){
				disable = true;
			}
			
			var fieldsets =  widget.findParentByType('panel').items.items;
			
			for (var i = 0; i < fieldsets.length; i++) {
				var fItem = fieldsets[i];
				if(fItem.xtype == 'dialogfieldset'){
					for (var j = 0; j < fItem.items.items.length; j++) {
							var item = fItem.items.items[j];
							if (jQuery.inArray(item.name, itemNamesToDisable) > -1){
								if(disable){
									item.setValue(true);
								}
								
							}				
					}
				}
				
			}			
		};
	
		this.switchDisableIfNecessary = function(widget, value, itemNamesToDisable, valuesWhichWillCauseDisable){
			var disable = false;
			var isInArray = jQuery.inArray(value, valuesWhichWillCauseDisable);
			if(isInArray > -1){
				disable = true;
			}
			var fieldsets =  widget.findParentByType('panel').items.items;
			
			for (var i = 0; i < fieldsets.length; i++) {
				var fItem = fieldsets[i];
				if(fItem.xtype == 'dialogfieldset'){
					for (var j = 0; j < fItem.items.items.length; j++) {
							var item = fItem.items.items[j];
							if (jQuery.inArray(item.name, itemNamesToDisable) > -1){
								if (disable) {
									item.setDisabled(true);
								} else {
									item.setDisabled(false);
								}
							}				
					}
				}
				
			}			
		};
		
		this.switchMandatoryPropDisableIfNecessary = function(widget, value, itemNamesToDisable, valuesWhichWillCauseDisable){
			var disable = false;
			var isInArray = jQuery.inArray(value, valuesWhichWillCauseDisable);
			if(isInArray > -1){
				disable = true;
			}
			var isFirst = true;
			var fieldsets =  widget.findParentByType('panel').items.items;
			var should = "";
			for (var i = 0; i < fieldsets.length; i++) {
				var fItem = fieldsets[i];
				if(fItem.xtype == 'dialogfieldset'){
					for (var j = 0; j < fItem.items.items.length; j++) {
							var item = fItem.items.items[j];
							
							if (jQuery.inArray(item.name, itemNamesToDisable) > -1){
								if(isFirst){
									item.setDisabled(false);
									isFirst = false;
									continue;
								}
								
								if(disable){
									item.setDisabled(true);
								}
								else if (should == "nein") {
									item.setDisabled(true);
								} else {
									item.setDisabled(false);
								}
								
								if(item.value == true || item.value == "true" ){
									should = "ja";
								}else {
									should = "nein";
								}
							}				
					}
				}
				
			}			
		};
	
	this.enableAndDisableWidgets = function(widget, currentValue, valuesWhichWillCauseTheChange, itemNamesToEnable, itemNamesToDisable){
		
		if(currentValue == null){
			currentValue = widget.value;
		}
		var valueInArray = jQuery.inArray(currentValue, valuesWhichWillCauseTheChange) > -1;
		if(!valueInArray){
			return;
		}
		
		var fieldsets =  widget.findParentByType('panel').items.items;			
		for (var i = 0; i < fieldsets.length; i++) {
			var fItem = fieldsets[i];
			for (var j = 0; j < fItem.items.items.length; j++) {					
				var item = fItem.items.items[j];
				var itemName = item.name;
				
				if(jQuery.inArray(itemName, itemNamesToEnable) > -1){
					item.setDisabled(false);
					console.log("Enable: " + item.fieldLabel + " (disabled=" + item.disabled + ")");
				}
				
				if(jQuery.inArray(itemName, itemNamesToDisable) > -1){
					item.setDisabled(true);
					console.log("Disable: " + item.fieldLabel + " (disabled=" + item.disabled + ")");
				}
			}  
		}
	};	
}

//function to get all available forms from page to display the options in the
//dialog
(function() {
	var getAvailableEnumOptions = new EnumerationOptions();
	window.getAvailableEnumOptions = function() {
		return getAvailableEnumOptions;
	};
})();
function EnumerationOptions() {
	
	this.getEnumerationOptionsJson = function(widget, path){
		var parsedEnumeration = eval(mrm.$.ajax({async:false, url: '/bin/ffe/enumeration.json?path='+path, type:'GET', cache :false}).responseText)
		for(var i = 0; i< parsedEnumeration.length; i++){
			if(parsedEnumeration[i].text === "none"){
				parsedEnumeration[i].value = "none";
			}
		}
		widget.setOptions(parsedEnumeration);
	};
	
};


//function to get all available follow on pages to display the options in the dialog
(function() {
	var getAvailableFollowOns = new AvailableFollowOns();
	window.getAvailableFollowOns = function() {
		return getAvailableFollowOns;
	};
})();

function AvailableFollowOns() {
	this.getFollowOnsJson = function(widget, path){
		widget.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/ffe/followonrequests.json?path='+path, type:'GET', cache :false}).responseText));
	};
}

// function to get all available forms from page to display the options in the
// dialog
(function() {
	var getAvailableForms = new AvailableForms();
	window.getAvailableForms = function() {
		return getAvailableForms;
	};
})();

function AvailableForms() {
	var valueFirstFormElement;
	var option;
	this.getFirstFormElementJson = function(widget, path){
			widget.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/ffe/formfields.json?path='+path, type:'GET', cache :false}).responseText));
	};
	
	this.getSecondFormElementJson = function(widget, path){
		var panel = widget.findParentByType('panel');
		var operator = getItemByName(panel, './operator');
		var option = operator.value;
		var firstFormElement = getItemByName(panel, './firstFormElement');
		widget.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/ffe/formfields.json?path='+path +'&option=' + option+ '&firstFormElement=' + firstFormElement.value, type:'GET', cache :false}).responseText));
};

	this.setSecondFormElementFromOptionJson = function(widget, option){
		this.option = option;
		var dialog = widget.findParentByType('dialog');
		var panel = widget.findParentByType('panel');
		if(this.valueFirstFormElement != undefined){
			var firstFormElementValue = this.valueFirstFormElement;
		}else{
			var firstFormElement = getItemByName(panel, './firstFormElement');
			var firstFormElementValue = firstFormElement.value;
		}
		var secondFormElement = getItemByName(panel, './secondFormElement');
		secondFormElement.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/ffe/formfields.json?path='+dialog.path +'&option=' + option + '&firstFormElement=' + firstFormElementValue, type:'GET', cache :false}).responseText));
};

	this.setSecondFormElementJson = function(widget, value){
		this.valueFirstFormElement = value;
		var dialog = widget.findParentByType('dialog');
		var panel = widget.findParentByType('panel');
		var secondFormElement = getItemByName(panel, './secondFormElement');
		if(this.option != undefined){
			var option = this.option;
		}else{
			var operator = getItemByName(panel, './operator');
			var option = operator.value;
		}
		
		secondFormElement.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/ffe/formfields.json?path='+dialog.path +'&option=' + option+ '&firstFormElement=' + value, type:'GET', cache :false}).responseText));
};
	
}

(function() {
	var getFieldLenghts = new FieldLenghts();
	window.getFieldLenghts = function() {
		return getFieldLenghts;
	};
})();


function FieldLenghts() {
	
	this.getComponentWidthJson = function(widget, path){
			widget.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/ffe/componentWidth.json?path='+path, type:'GET', cache :false}).responseText));
	};
	
	this.getFieldWidthJson = function(widget, path){
		widget.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/ffe/fieldWidth.json?path='+path, type:'GET', cache :false}).responseText));
};
	
};

//function create a list with all options depends on the given property
(function() {
	var getInformationVariant = new InformationVariant();
	window.getInformationVariant = function() {
		return getInformationVariant;
	};
})();


function InformationVariant(){
	 this.getVariant = function(panel) {
		 var parentDialog = panel.findParentByType('dialog');
			var parentDialogPath = parentDialog.initialConfig.responseScope.path;
		 var txt = mrm.$.ajax({async:false, url: '/bin/ffe/requestInformationVariant?path='+parentDialogPath, type:'GET', cache :false}).responseText;
		 if(txt != 'download'){
			 panel.setDisabled(true)
		 	}
		}
	 
	 
}

// function create a list with all options depends on the given property
(function() {
	var getOperatorList = new OperatorList();
	window.getOperatorList = function() {
		return getOperatorList;
	};
})();


function OperatorList(){
	 this.getList = function(widget, value) {
		widget.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/ffe/operatorlist.json?value='+value, type:'GET', cache :false}).responseText));
		}
	 
	 this.setList = function(widget, value){
			var panel = widget.findParentByType('panel');
			var operatorDropdown = getItemByName(panel, './operator');
			operatorDropdown.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/ffe/operatorlist.json?value='+value, type:'GET', cache :false}).responseText));
		}
}


// function create a list with all options depends on the given property
(function() {
	var getAvailableConstraint = new AvailableConstraint();
	window.getAvailableConstraint = function() {
		return getAvailableConstraint;
	};
})();

function AvailableConstraint(){
	 this.getConstraintJson = function(widget, path) {
		widget.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/ffe/constraint.json?path='+path, type:'GET', cache :false}).responseText));
		}
	 
	 this.getSimpleConstraintJson = function(widget, path) {
			widget.setOptions(eval(mrm.$.ajax({async:false, url: '/bin/ffe/constraint.json?path='+path +'&simple=simple', type:'GET', cache :false}).responseText));
			}
}


(function() {
	var getDialogInfoText = new DialogInfoText();
	window.getDialogInfoText = function() {
		return getDialogInfoText;
	};
})();

function DialogInfoText(){
	
	var oldValue;
	
	 this.setTextualRepresentation = function(widget, value, position) {
		 var dialog = widget.findParentByType('dialog');
		 var panel = widget.findParentByType('panel');
		var textualRepresentation = getItemByName(panel, './textualRepresentation');
			
		if(this.oldValue != undefined){
				var oldTxt = this.oldValue;
			}
			var txt = mrm.$.ajax({async:false, url: '/bin/ffe/text_representation?path='+dialog.path +'&value='+value+'&position='+position+'&oldTxt='+oldTxt, type:'GET', cache :false}).responseText;
			
			this.setValue(txt);
			textualRepresentation.updateText(eval(txt));
		}
	 
	 this.setValue = function(value){
		 this.oldValue = value;
		 
	 }
}


(function() {
	var getDownloadVariantVisibility = new DownloadVariantVisibility();
	window.getDownloadVariantVisibility = function() {
		return getDownloadVariantVisibility;
	};
})();

function DownloadVariantVisibility(){
	
	 this.setVisibility = function(widget, value) {
		 var preconfiguredform;
		 
		 var itemNamesToDisable = ['./thank_you_page', './referenceRequestInformationDownload'];
		 var dialog = widget.findParentByType('dialog');
		 var panel = widget.findParentByType('panel');
		 if(value != undefined ){
			 preconfiguredform = value;
		 }else {
			 preconfiguredform = getItemByName(panel, './preconfiguredform').value;
		 }
		 if(preconfiguredform == ""){
			 return;
		 }
			var isDownloadVariant = mrm.$.ajax({async:false, url: '/bin/ffe/is_download?path='+preconfiguredform, type:'GET', cache :false}).responseText;
			 
				var fieldsets =  widget.findParentByType('panel').items.items;
				for (var i = 0; i < fieldsets.length; i++) {
					var fItem = fieldsets[i];
						for (var j = 0; j < fItem.items.items.length; j++) {
								var item = fItem.items.items[j];
								if (jQuery.inArray(item.name, itemNamesToDisable) > -1){
									if(item.name == './thank_you_page'){
										if(isDownloadVariant == "download"){
											item.setDisabled(true);
										}else {
											item.setDisabled(false);
										}
									}else if(item.name == './referenceRequestInformationDownload'){
										if(isDownloadVariant == "post"){
											item.setDisabled(false);
										}else{
											item.setDisabled(true);
										}
									}
									else{
										item.setDisabled(false);
									}
									
								}
						}	
			}
	}
}

// functions for cookies
(function() {
	var getFfeAuthorCookie = new FfeAuthorCookie();
	window.getFfeAuthorCookie = function() {
		return getFfeAuthorCookie;
	};
})();

function FfeAuthorCookie(){
	
	var cookieName = "ffe.author.preferences"
	
	this.getValue = function(name, defaultVal) {
		var cookieData = mrm.$.cookie(cookieName);
		if(typeof cookieData == "string") {
			var data = eval('(' + cookieData + ')');
			if (typeof(data[name]) != undefined) {
				return data[name];
			} else {
				return defaultVal;
			}
		} else {
			return defaultVal;
		}
	}
	
	this.setValue = function(name, value) {
		var cookieData = mrm.$.cookie(cookieName);
		if (cookieData === null) {
			mrm.$.cookie(cookieName, "{}", {expires: 3562, path: "/"});
			cookieData= "{}";
		}
		var data = eval('(' + cookieData + ')');
		data[name] = value;
		mrm.$.cookie(cookieName, arraySerialize(data), {expires: 3562, path: "/"});
	}
	
	function arraySerialize(array) {
		var s = "{";
		for (i in array) {
			s += i + ":";
			if (typeof array[i] === "string") {
				s += "\"" + array[i] + "\"";
			} else {
				s += array[i];
			}
			s += ","
		}
		if (s.match(/,$/)) {
			s = s.slice(0, -1);
		}
		s += "}";
		
		return s;
	}
}



// function used to render calendar into panel of a dialog
(function() {
	var informationText = new InformationText();
	window.informationText = function () {
		return informationText;
	};
})();

function InformationText() {
	
	// public
	this.load = function(panel) {
		var parentDialog = panel.findParentByType('dialog');
		var parentDialogPath = parentDialog.initialConfig.responseScope.path;
		CQ.Ext.Ajax.request({
			url: "/bin/ffe/saveinformation?path=" + escape(parentDialogPath),
			success: function(response, opts) {
			panel.updateText(eval(response.responseText));
			}
		});
		
	};
}

function getItemByName(panel, propName) {
	var fieldsets = panel.items.items;
	for (var i = 0; i < fieldsets.length; i++) {
		var fItem = fieldsets[i];
			for (var j = 0; j < fItem.items.items.length; j++) {
					var item = fItem.items.items[j];
						if (item.name == propName) {
							return item;
						}
		
			}
	}
}

function getPathForPanel(panel) {
	var parentDialog = panel.findParentByType('dialog');
	if(parentDialog.initialConfig.responseScope) {
		return parentDialog.initialConfig.responseScope.path
	}
	return null;
}

//functions for cookies
(function() {
	var getCopyPage = new CopyPage();
	window.getCopyPage = function() {
		return getCopyPage;
	};
})();

function CopyPage(){
	
	var destinationType;
	
	var targetName;
	
	this.initOkButton= function(widget, path, targetPath, targetName) {
		var okButton = CQ.Ext.DomQuery.select('table.cq-btn-ok');
		if(okButton) {
			okButton = CQ.Ext.get(okButton);
			okButton.on('click', function() {
				var panel = widget.findParentByType('panel');
				var destinationType = panel.items.items[0].items.items[0].value;
				var pathObject = getItemByName(panel, path);
				var targetPathObject = getItemByName(panel, targetPath);
				var targetNameObject = getItemByName(panel, targetName);
				if((undefined != pathObject.value)&&(undefined != targetPathObject.value)&&(undefined != targetNameObject.value)){
				CQ.Ext.Ajax.request({
					url		:  '/bin/ffe/formcopy?sourcePath='+pathObject.value+'&targetPath='+targetPathObject.value+'&targetName='+targetNameObject.value+'&destinationType='+destinationType,
					success	: function(response, opts) {
						window.location = response.responseText+'.html';
					},
					failure: function(response, opts) {
						CQ.Ext.Msg.show({
							title: 'Error',
							msg: 'An error occured while copying the form template',
							buttons: CQ.Ext.Msg.OK,
							icon: CQ.Ext.Msg.ERROR
						});
					}
				});
				}
				return true;
			});
		}
	};
	
	this.setValueType = function(widget, value){
			widget.setValue(value);
		}
}

function calcZIndexForInheritButton() {
	var maxZIndex = getNextHighestZindex();
	jQuery('.cq-style.inherited_value').each(function(){
		jQuery(this).css('z-index', maxZIndex);
	});
}

function showInheritedValueBox(divId) {
	var div = CQ.Ext.DomQuery.select('#' + divId);
	var divObj = CQ.Ext.get(div);
	divObj.show();
	//document.getElementById(divId).setAttribute('style', 'padding: 5px; z-index: 10000; background-color: white;');
}

function showInheritedValueBoxInPopup(divId) {
	var maxZIndex = getNextHighestZindex();
	jQuery('#' + divId).dialog({autoOpen:false,width:600,modal:true, zIndex:maxZIndex});
	jQuery('#' + divId).dialog('open');
}


function getNextHighestZindex(){
	var zmax = 0;
	jQuery('*').each(function() {
		var cur = parseInt(jQuery(this).css('z-index'));
		zmax = cur > zmax ? cur : zmax;
	});
	return zmax+10;
}


function hideInheritedValueBox(divId) {
	var div = CQ.Ext.DomQuery.select('#' + divId);
	var divObj = CQ.Ext.get(div);
	divObj.hide();
}

function hideInheritedValueBoxInPopup(divId) {
	jQuery('#' + divId).dialog('destroy');
}


function adoptUpdates(divId) {
	var div = CQ.Ext.DomQuery.select('#' + divId);
	var divObj = CQ.Ext.get(div);
	var tableRows = CQ.Ext.DomQuery.select('#' + divId + ' tbody tr');

	var query = "";
	var queryReject = "";
	CQ.Ext.each(tableRows, function(element) {
		var input = element.getElementsByTagName('input')[0];
		var checked = input.checked;
		if (checked == true) {
			var path = escape(input.id);
			var value = escape(input.value);
			query += path + "=" + value  + ";";  
		}

		input = element.getElementsByTagName('input')[1];
		if(input !== undefined){
			checked = input.checked;
			if (checked == true) {
				var path = escape(input.id);
				var value = escape(input.value);
				queryReject += path + "=" + value  + ";";  
			}
		}
	});
	if (query != "") {
		CQ.Ext.Ajax.request({
			url		:  '/bin/ffe/adoptupdatedvalues?properties=' + query,
			success	: function(response, opts) {
				window.location.reload();
			},
			failure: function(response, opts) {
				window.location.reload();
			}
		})
	}
	if (queryReject != "") {
		CQ.Ext.Ajax.request({
			url		:  '/bin/ffe/rejectupdatedvalues?properties=' + queryReject,
			success	: function(response, opts) {
				window.location.reload();
			},
			failure: function(response, opts) {
				window.location.reload();
			}
		})
	}
}

function adoptAllUpdates(divId) {
	var div = CQ.Ext.DomQuery.select('#' + divId);
	var divObj = CQ.Ext.get(div);
	var tableRows = CQ.Ext.DomQuery.select('#' + divId + ' tbody tr');

	var query = new Array;
	var counter = 0;
	var arrayIndex = 0;
	CQ.Ext.each(tableRows, function(element) {
		var input = element.getElementsByTagName('input')[0];
		if(input != undefined && input.id != ""){
			if(counter == 0){
				query[arrayIndex] = "";
			}
			var path = escape(input.id);
			var value = escape(input.value);
			query[arrayIndex] += path + "=" + value  + ";";
			if(counter < 20){
				counter = counter + 1;
			} else {
				counter = 0;
				arrayIndex = arrayIndex + 1;
			}
		}
	});
	for (var i = 0; i < query.length; ++i){
		if (query[i] != undefined) {
			if(i == arrayIndex){
				CQ.Ext.Ajax.request({
					url		:  '/bin/ffe/adoptupdatedvalues?properties=' + query[i],
					success	: function(response, opts) {
						window.location.reload();
					},
					failure: function(response, opts) {
						window.location.reload();
					}
				})
			} else {
				CQ.Ext.Ajax.request({
					url		:  '/bin/ffe/adoptupdatedvalues?properties=' + query[i]
				})
	
			}
		}
	}
}

function rejectAllUpdates(divId) {
	var div = CQ.Ext.DomQuery.select('#' + divId);
	var divObj = CQ.Ext.get(div);
	var tableRows = CQ.Ext.DomQuery.select('#' + divId + ' tbody tr');

	var queryReject = new Array();
	var counter = 0;
	var arrayIndex = 0;
	CQ.Ext.each(tableRows, function(element) {
		input = element.getElementsByTagName('input')[1];
		if(input != undefined && input.id != ""){
			if(counter == 0){
				queryReject[arrayIndex] = "";
			}
			var path = escape(input.id);
			var value = escape(input.value);
			queryReject[arrayIndex] += path + "=" + value  + ";";
			if(counter < 20){
				counter = counter + 1;
			} else {
				counter = 0;
				arrayIndex = arrayIndex + 1;
			}
		}
	});
	
	for (var i = 0; i < queryReject.length; ++i){
		if (queryReject[i] != undefined) {
			console.log(queryReject[i]);
			if(i == arrayIndex){
				CQ.Ext.Ajax.request({
					url		:  '/bin/ffe/rejectupdatedvalues?properties=' + queryReject[i],
					success	: function(response, opts) {
						window.location.reload();
					},
					failure: function(response, opts) {
						window.location.reload();
					}
				})
			} else {
				CQ.Ext.Ajax.request({
					url		:  '/bin/ffe/rejectupdatedvalues?properties=' + queryReject[i]
				})
	
			}
		}
	}
}

// The function calculates parameters for pop-up windows. The function considers multiple screens.
function popupParams(width, height) {
    var a = typeof window.screenX != "undefined" ? window.screenX : window.screenLeft;
    var i = typeof window.screenY != "undefined" ? window.screenY : window.screenTop;
    var g = typeof window.outerWidth!="undefined" ? window.outerWidth : document.documentElement.clientWidth;
    var f = typeof window.outerHeight != "undefined" ? window.outerHeight: (document.documentElement.clientHeight - 22);
    var h = (a < 0) ? window.screen.width + a : a;
    var left = parseInt(h + ((g - width) / 2), 10);
    var top = parseInt(i + ((f-height) / 2.5), 10);
    return "width=" + width + ",height=" + height + ",left=" + left + ",top=" + top;
}

// The function adds the path fragment "/content" to the href of a link if the href doesn't already start with "/content".
// In some cases the URLs don't contain "/content" which causes some errors.
// This function is necessary because links with a href that starts with "/content" 
// are filtered out by the server so this path fragment must be added on client side.
function addPathFragmentContentToHref(formLink){	
	var formHref = formLink.href;				
	if(formHref.indexOf("/content/") == -1){
		var index = formHref.indexOf("/");
		index = formHref.indexOf("/", index + 1);
		index = formHref.indexOf("/", index + 1);				
		var protocolAndDomain = formHref.substring(0, index);
		var path = formHref.substring(index);				
		formHref = protocolAndDomain + "/content" + path;				
		formLink.href = formHref;						
	}			
}

//function to requests the variants for this form
(function() {
	var getNewsletterIds = new NewsletterIds();
	window.getNewsletterIds = function() {
		return getNewsletterIds;
	};
})();

function NewsletterIds() {
	this.getNewsletterIdsJson = function(widget, path) {
		widget.setOptions(eval(jQuery.ajax({async:false, url: '/bin/ffe/newsletter_ids.json?path=' + escape(path), type:'GET', cache :false}).responseText));
	};
	
}

(function() {
	var getTypeOfFormVisibility = new TypeOfFormVisibility();
	window.getTypeOfFormVisibility = function() {
		return getTypeOfFormVisibility;
	};
})();

function TypeOfFormVisibility(){
	var typeValue;
	
	 this.setVisibility = function(widget, path) {
		 //set typevalue because the selectionchange event also starts after loading dialog. 
		 //the openWindow function needs to know if the select option is change or if just the dialog is loaded.
		 this.typeValue = widget.value;
		 var isCorrectRequestType = mrm.$.ajax({async:false, url: '/bin/ffe/checkRequestType?path='+path, type:'GET', cache :false}).responseText;
		 if (isCorrectRequestType == "false") {
			 widget.setDisabled(true);
		 }
	}
	 
	 this.openWindow = function(widget, value){
		//just call the alert, if the dialog is still open and the selection is changed, not while the dialog is openig
		    if(value == 'preLaunchForm' && this.typeValue != 'standardForm'){
		    	alert("Please keep in mind, that the type of the form decides, how \nthe submit is processed and if it is forwarded to the dealer or \nnot. You should only change it, if you are certain.");
		   		}
		 this.typeValue = "";
		   	}
}



