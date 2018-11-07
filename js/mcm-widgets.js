/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/


// initialize CQ.mcm package
CQ.Ext.ns("CQ.mcm");

CQ.Ext.ns("CQ.mcm.form");
CQ.Ext.ns("CQ.mcm.utils");

// initialize CQ.themes package
CQ.Ext.ns("CQ.mcm.themes");


/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/

/**
 * This class manages the plugins for CQ.mcm. See CQ.mcm.AbstractPlugin
 * for how to implement a plugin.
 *
 * @class CQ.mcm.PluginHook
 * @static
 * @singleton
 */
CQ.mcm.PluginHook = {
    plugins: {},
    addPlugin: function(pluginId, pluginObject) {
        if (this.plugins[pluginId]) {
            console.error("MCM JS Plugin added twice: ", pluginId);
        }
        this.plugins[pluginId] = pluginObject;
    },
    getPlugin: function(pluginId) {
        if (this.plugins[pluginId]) {
            return this.plugins[pluginId];
        } else {
            console.error("MCM JS Plugin missing: ", pluginId);
        }
    }
};

/**
 * Plugins should implement an MCMPlugin Java class and this class for the
 * JS plugin functionality. One instance should be created and added with
 * a call to CQ.mcm.PluginHook.addPlugin("pluginId", theAbstractPluginSubclassInstance) .
 * 
 * For a simple plugin with one touchpoint and one experience it should suffice
 * to implement the class and set the member variables indicating paths etc.
 *
 * @class CQ.mcm.Util
 * @abstract
 */
CQ.mcm.AbstractPlugin = CQ.Ext.extend(Object, {
    
    experiencePropertiesDialogPath: "experiencePropsDialogPathMissing",
    touchpointPropertiesDialogPath: "touchpointPropsDialogPathMissing",
    
    constructor: function(config) {
        // CQ.mcm.AbstractPlugin.superclass.constructor.call(this);
    },
    
    /**
     * The calling function will present the data object gotten from the server
     * for which the properties are to be shown, so implementing classes might
     * do some switching depending on some internal type logic.
     *
     */
    getExperiencePropertiesDialogPath: function(dataobject) {
        return this.experiencePropertiesDialogPath;
    },
    
    /**
     * The calling function will present the data object gotten from the server
     * for which the properties are to be shown, so implementing classes might
     * do some switching depending on some internal type logic.
     *
     */
    getTouchpointPropertiesDialogPath: function(dataobject) {
        return this.touchpointPropertiesDialogPath;
    }
});

CQ.mcm.DefaultPlugin = CQ.Ext.extend(CQ.mcm.AbstractPlugin, {
    constructor: function(config) {
        CQ.mcm.DefaultPlugin.superclass.constructor.call(this);
    },
    
    /**
     * The calling function will present the data object gotten from the server
     * for which the properties are to be shown, so implementing classes might
     * do some switching depending on some internal type logic.
     *
     */
     getExperiencePropertiesDialogPath: function(dataobject) {
        var retval = null;
        if(dataobject.data.type == "newsletter") {
            retval = "/libs/mcm/components/newsletter/settings/dialog.infinity.json";
        } else if(dataobject.data.type == "landingpage"){
			retval = "/libs/foundation/components/page/dialog.infinity.json";
        } else if(dataobject.data.type == "promotion"){
			retval = "/libs/commerce/components/promotion/dialog.infinity.json";
        } else if(dataobject.data.type == "voucher"){
			retval = "/libs/commerce/components/voucher/dialog.infinity.json";
        } else if(dataobject.data.type == "experience"){
			retval = "/libs/cq/personalization/components/experiencepage/dialog.infinity.json";
        }else {
            retval = "/libs/cq/personalization/components/teaserpage/dialog.infinity.json";
        }
        return retval;
    },

    
    /**
     * The calling function will present the data object gotten from the server
     * for which the properties are to be shown, so implementing classes might
     * do some switching depending on some internal type logic.
     *
     */
    getTouchpointPropertiesDialogPath: function(dataobject) {
        return this.touchpointPropertiesDialogPath;
    }
});

CQ.mcm.PluginHook.addPlugin("defaultMCM", new CQ.mcm.DefaultPlugin());
CQ.mcm.PluginHook.addPlugin("landingpageMCM", new CQ.mcm.DefaultPlugin());


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

CQ.mcm.utils.Newsletter = {};

CQ.mcm.utils.Newsletter.loadMailingListMembers = function(target, groupId, dialog) {
    if (target) {
        var tpl = CQ.mcm.utils.Newsletter.MEMBER_LIST_TMPL;
        var el;
        if (dialog) {
            el = dialog.getEl();
        } else {
            el = target.ownerCt.getEl();
        }
        if (el) {
            el.mask(CQ.I18n.getMessage("Loading..."), 'x-mask-loading');
        }
        var res = CQ.mcm.utils.Newsletter.get(CQ.mcm.utils.Newsletter.DEFAULT_LISTRCPTS_PATH +CQ.HTTP.EXTENSION_JSON, {"recipients":groupId, "limit":CQ.mcm.utils.Newsletter.DEFAULT_MEMBER_LIMIT});
        if (res) {
            if (dialog && dialog.setRecipientsCnt) {
                dialog.setRecipientsCnt(res.num);
            }
            res.title = CQ.I18n.getMessage('The selected list contains {0} recipient(s) for the newsletter', res.num);
            res.emptyTitle = CQ.I18n.getMessage('Nobody will receive this newsletter: No member of the selected list has a valid e-mail address.');
            res.truncationTitle = CQ.I18n.getMessage('The selected list contains more than {0} recipients', res.num);
            res.truncationDescription = CQ.I18n.getMessage('The first {0} are listed below:', res.limit);
            res.description = CQ.I18n.getMessage('Recipient(s):');
            tpl.compile();
            tpl.overwrite(target.getEl(), res);
            target.show()
        }
        if (el) el.unmask();
    }
};

CQ.mcm.utils.Newsletter.flighttest = function(dialog, box, successCb, failureCb) {
    var tpl = CQ.mcm.utils.Newsletter.FLIGHT_TEST_RESULT_TMPL;
    var heading = CQ.I18n.getMessage("Result");
    var act = new CQ.Ext.form.Action.Submit(dialog.form, {
        'waitMsg':CQ.I18n.getMessage('Test in progress'),
        'url': CQ.HTTP.externalize(CQ.mcm.utils.Newsletter.DEFAULT_TEST_PATH+CQ.HTTP.EXTENSION_JSON),
        'clientValidation':false,
        'method':'POST',
        'success': function() {
            if (box) {
                tpl.compile();
                tpl.overwrite(box.getEl(), {
                    heading:heading,
                    title:CQ.I18n.getMessage('Newsletter successfully sent'),
                    description:CQ.I18n.getMessage('You can now check the newsletter in your mailbox.')});
                box.show();
            }
            if (successCb) {
                successCb.call(this, dialog);
            }
        },
        'failure': function(form, action) {
            var res = action.result ? action.result.testStatus : action.response.status;
            if (box) {
                tpl.compile();
                tpl.overwrite(box.getEl(), {
                    heading:heading,
                    description:CQ.mcm.utils.Newsletter.lookupStatus(res),
                    title:CQ.I18n.getMessage("Failed to send newsletter")});
                box.show()
            }
            if(failureCb) {
                failureCb.call(this, dialog);
            }
        }
    });
    act.handleResponse = function(response) {
        var res = CQ.Ext.decode(response.responseText);
        var code = res.testStatus;
        var success = code > -1 && code< 2;
        if (success && !res.numRecipients) {
            res.testStatus = -9
        } else {
            res.success = success;
        }
        return res;
    };
    dialog.form.doAction(act);
};


CQ.mcm.utils.Newsletter.publish = function(dialog, box, successCb, failureCb, url) {
    var heading = CQ.I18n.getMessage("Result");
    var _url = url ? url : CQ.HTTP.externalize(CQ.mcm.utils.Newsletter.EMAILSERVICE_SELECTOR + CQ.mcm.utils.Newsletter.PUBLISH_PARAMS + CQ.EmailService.getConfiguration());
    var act = new CQ.Ext.form.Action.Submit(dialog.form, {
        'waitMsg':CQ.I18n.getMessage('Publish in progress'),
        'url': _url,
        'clientValidation':false,
        'method':'POST',
        'success': function() {
            if (box) {
            	CQ.mcm.utils.Newsletter.showResponseMessage(box, {
                    heading:heading,
                    title:CQ.I18n.getMessage('Newsletter successfully published'),
                    description:CQ.I18n.getMessage('You can now check the newsletter in Email Service Provider.')});
            }
            if(!CQ.mcm.utils.Newsletter.checkPublished())
            {
            	CQ.mcm.utils.Newsletter.addPublished();
            }
            if (successCb) {
                successCb.call(this, dialog);
            }
        },
        'failure': function(form, action) {
            var res = action.result ? action.result.testStatus : action.response.status;
            if (box) {
                CQ.mcm.utils.Newsletter.showResponseMessage(box, {
                    heading:heading,
                    description:(CQ.mcm.utils.Newsletter.lookupStatus(res) + (action.result.testStatusText ? action.result.testStatusText : "")),
                    title:CQ.I18n.getMessage("Failed to publish newsletter")});
            }
            if(failureCb) {
                failureCb.call(this, dialog, action);
            }
        }
    });
    act.handleResponse = function(response) {
        var res = CQ.Ext.decode(response.responseText);
        var code = res.testStatus;
        var success = code > -1 && code< 2;
        if (success) {
            res.success = success;
        }
        return res;
    };
    dialog.form.doAction(act);
};

CQ.mcm.utils.Newsletter.publish.setNewsletterProperty = function(propertyName){
	if(typeof propertyName!='string')
		return;
	try{
		var propertyInput = document.getElementsByName(propertyName)[0];
		if(propertyInput){
			this.setValue(propertyInput.value);
		}
	}catch(e){
		
	}
	
}
CQ.mcm.utils.Newsletter.addPublished = function()
{
	var published = $CQ('<input/>',{type:'hidden',id:"published_html_attr",value:true,name:"published_html_attr"});
	published.appendTo($CQ('body'));
};
CQ.mcm.utils.Newsletter.update = function(dialog, successCb, failureCb,url) {
	if(!CQ.mcm.utils.Newsletter.checkPublished(true))
		return;
	var _url = url ? CQ.HTTP.externalize(url): CQ.HTTP.externalize(CQ.mcm.utils.Newsletter.EMAILSERVICE_SELECTOR + CQ.mcm.utils.Newsletter.UPDATE_PARAMS + CQ.EmailService.getConfiguration());
	successCb = successCb ? successCb : CQ.mcm.utils.Newsletter.updateSuccessCb;
	failureCb = failureCb ? failureCb : CQ.mcm.utils.Newsletter.updateFailureCb;
	CQ.mcm.utils.Newsletter.publish(dialog, undefined, successCb, failureCb, _url);
	
};

CQ.mcm.utils.Newsletter.updateSuccessCb = function(dialog)
{
	var box=dialog.findByType('displayfield');
	if(box)
	{
		CQ.mcm.utils.Newsletter.showResponseMessage(box[0], {
            heading:CQ.I18n.getMessage("Result"),
            title:CQ.I18n.getMessage('Newsletter successfully updated'),
            description:CQ.I18n.getMessage('You can now check the newsletter in Email Service Provider.')});
	}
};

CQ.mcm.utils.Newsletter.updateFailureCb = function(dialog, action) {
    var res = action.result ? action.result.testStatus : action.response.status;
    var box=dialog.findByType('displayfield');
    if (box) {
        CQ.mcm.utils.Newsletter.showResponseMessage(box[0], {
            heading:CQ.I18n.getMessage("Result"),
            description:(CQ.mcm.utils.Newsletter.lookupStatus(res) + action.result.testStatusText),
            title:CQ.I18n.getMessage("Failed to update newsletter")});
    }
};

CQ.mcm.utils.Newsletter.showResponseMessage = function(box,msgObject)
{
	var tpl = CQ.mcm.utils.Newsletter.FLIGHT_TEST_RESULT_TMPL;
	if(box)
	{
		tpl.compile();
		tpl.overwrite(box.getEl(),msgObject);
		box.show();
	}
};

CQ.mcm.utils.Newsletter.checkPublished = function(showMsg){
	var published = document.getElementById("published_html_attr");
	if(!published && showMsg)
	{
		CQ.Ext.Msg.show({
        	title:CQ.I18n.getMessage('Info'),
        	msg: CQ.I18n.getMessage('Newsletter is not published'),
        	buttons: CQ.Ext.Msg.OK,
        	icon: CQ.Ext.Msg.INFO 
    	});			
	}
	return published;
}
CQ.mcm.utils.Newsletter.loadProfile = function(user) {
    var url = user.getHome();
    if (url) {
        url += '/profile' + CQ.HTTP.EXTENSION_JSON;
        return CQ.mcm.utils.Newsletter.get(url);
    }
    return null;
};

CQ.mcm.utils.Newsletter.get = function(url, param) {
    url = CQ.HTTP.externalize(url)
            + CQ.Sling.SELECTOR_INFINITY + CQ.HTTP.EXTENSION_JSON;
    for (var name in param) {
        url = CQ.HTTP.addParameter(url, name, param[name]);
    }
    url = CQ.HTTP.addParameter(url, CQ.Sling.CHARSET, "utf8");
    url = CQ.HTTP.noCaching(url);
    var res = CQ.HTTP.get(url);
    if (CQ.HTTP.isOk(res)) {
        return CQ.HTTP.eval(res);
    }
    return null;
};

CQ.mcm.utils.Newsletter.lookupStatus = function (statusCode) {
    var res = CQ.mcm.utils.Newsletter.STATUS_CONSTANTS[statusCode];
    if (res) {
        return res;
    } else {
        return "";
    }
};

CQ.mcm.utils.Newsletter.STATUS_CONSTANTS = {
    '-1': CQ.I18n.getMessage('Connection to server timed out.'),
    '-9': CQ.I18n.getMessage('Address entered is not a valid e-mail address.'),
    '-10': CQ.I18n.getMessage('The newsletter cannot be read.'),
    '-11': CQ.I18n.getMessage('The destination address is not valid.'),
    '-12': CQ.I18n.getMessage('No replication agent available to activate the assets. Please check your replication settings.'),
    '-13': CQ.I18n.getMessage('An error occured during assets activation. Please check if you have sufficient privileges.'),
    '-14': CQ.I18n.getMessage('The mail server denied relying for the given from e-mail address.'),
    '503': CQ.I18n.getMessage('Some required services are not active. Please check your system configuration.'),
    '400': CQ.I18n.getMessage('Please fill out all fields.'),
    '401': CQ.I18n.getMessage('The newsletter cannot be built. Please check if you have sufficient permissions.'),
    '1': CQ.I18n.getMessage('Sent'),
    '2': CQ.I18n.getMessage('Error'),
    '3': CQ.I18n.getMessage('The page containing the letter cannot be retrieved'),
    '4': CQ.I18n.getMessage('There is no mail server configured, please check your system configuration.'),
    '5': CQ.I18n.getMessage('The recipient address is not a valid e-mail address.'),
    '6': CQ.I18n.getMessage('The page cannot be formatted as an e-mail message.'),
    '7': CQ.I18n.getMessage('Unable to connect to the mail server, please check your system configuration.'),
    '8': CQ.I18n.getMessage('Mail cannot be sent.'),
    '9': CQ.I18n.getMessage('Please activate the email before running this operation.')
};

CQ.mcm.utils.Newsletter.DEFAULT_MEMBER_LIMIT = 500;

CQ.mcm.utils.Newsletter.DEFAULT_NEWLETTER_PATH = "/libs/mcm/content/newsletter";

CQ.mcm.utils.Newsletter.EMAILSERVICE_SELECTOR = "/_jcr_content.emailservice.json";

CQ.mcm.utils.Newsletter.PUBLISH_PARAMS = "?operation=publishEmail&cfgpath=";

CQ.mcm.utils.Newsletter.UPDATE_PARAMS = "?operation=updateEmail&cfgpath=";

CQ.mcm.utils.Newsletter.DEFAULT_SEND_PATH = CQ.mcm.utils.Newsletter.DEFAULT_NEWLETTER_PATH;

CQ.mcm.utils.Newsletter.DEFAULT_TEST_PATH = CQ.mcm.utils.Newsletter.DEFAULT_NEWLETTER_PATH + ".flighttest";

CQ.mcm.utils.Newsletter.DEFAULT_PUBLISH_PATH = CQ.mcm.utils.Newsletter.DEFAULT_NEWLETTER_PATH + ".publish";

CQ.mcm.utils.Newsletter.DEFAULT_PUBLISH_DIALOG = "/libs/mcm/components/newsletter/publish/dialog.infinity.json"
	
CQ.mcm.utils.Newsletter.DEFAULT_SETTINGS_DIALOG = "/libs/mcm/components/newsletter/settings/dialog.infinity.json"
	
CQ.mcm.utils.Newsletter.DEFAULT_LISTRCPTS_PATH = CQ.mcm.utils.Newsletter.DEFAULT_NEWLETTER_PATH + ".listrecipients";

CQ.mcm.utils.Newsletter.FLIGHT_TEST_RESULT_TMPL = new CQ.Ext.Template(
        '<div class="cq-flighttest-restult">',
            '<div class="cq-flighttest-heading">{heading}</div>',
            '<div class="cq-flighttest-title">{title}</div>',
            '<div class="cq-flighttest-description">{description}</div>',
        '</div>');

CQ.mcm.utils.Newsletter.MEMBER_LIST_TMPL = new CQ.Ext.XTemplate(
        '<div class="cq-members">',
            '<tpl if="num &gt; 0">',
            '   <div class="cq-members-title">{[values.truncated ? values.truncationTitle : values.title]}</div>',
//               '<div class="cq-members-description">{[values.truncated ? values.truncationDescription : values.description]}</div>',
                '<ul class="cq-members-list">',
                    '<tpl for="members"><li><span class="email">{email}</span><tpl if="name"><span class="name">({name})</span></tpl></tpl>',
                '</ul>',
                '<tpl if="truncated">'+CQ.I18n.getMessage("more...")+'</tpl>',
            '</tpl>',
            '<tpl if="num==false"><div class="cq-members-title cq-members-empty">{emptyTitle}</div></tpl>',
        '</div>');


CQ.mcm.utils.Newsletter.openDialog = function(editComponent, url, reloadPage) {
        CQ.mcm.Util.openDialog(editComponent.path, url, reloadPage);
}

CQ.mcm.utils.Newsletter.openPublishDialog = function(editComponent,reloadPage) {
	var url;
	if(CQ.mcm.utils.Newsletter.publishDialogPath)
		url = CQ.mcm.utils.Newsletter.publishDialogPath;
	else
		url = CQ.mcm.utils.Newsletter.DEFAULT_PUBLISH_DIALOG;
    CQ.mcm.Util.openDialog(editComponent.path, url, reloadPage);
}

CQ.mcm.utils.Newsletter.openSettingsDialog = function(editComponent,reloadPage) {
	var url;
	if(CQ.mcm.utils.Newsletter.settingsDialogPath)
		url = CQ.mcm.utils.Newsletter.settingsDialogPath;
	else
		url = CQ.mcm.utils.Newsletter.DEFAULT_SETTINGS_DIALOG;
    CQ.mcm.Util.openDialog(editComponent.path, url, reloadPage);
}

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/

/**
 * A helper class providing a basic set of utilities.
 * @static
 * @singleton
 * @class CQ.mcm.Util
 */
CQ.mcm.Util = {

    openDialog: function(content, url, reloadPage, successHandler, failureHandler) {
        var d = CQ.WCM.getDialog(url);
        if(d) {
            d.success = function(form, action) {
                if( reloadPage ) {
                        CQ.Util.reload(CQ.WCM.getContentWindow());
                }
                if (successHandler !== undefined) {
                    successHandler(d);
                }
            };
            d.failure = function(form, action) {
                if (failureHandler !== undefined) {
                    failureHandler(d);
                }
            };
            d.show();
            d.loadContent(content);
        }
    },

    createPageAndOpenPropsDialog: function(dialogTitle, parentPath, success, failure, scope, additionalPropsToSet) {
        var dialog = CQ.wcm.Page.getCreatePageDialog(parentPath);
        dialog.responseScope = scope;                               
        dialog.success = function(form, xhr) {
        
            var response = CQ.HTTP.buildPostResponseFromHTML(xhr.response);
            var path = response.headers[CQ.utils.HTTP.HEADER_PATH];
            var contentPath = path + "/jcr:content";
            
            if (additionalPropsToSet) {
                CQ.HTTP.post(
                    path + "/jcr:content",
                    function(options, isSuccess, response) {
                        if (isSuccess) {
                            CQ.mcm.Util.showPropsDialog(contentPath, success, failure, scope);
                        } else {
                            CQ.Ext.Msg.alert(
                                CQ.I18n.getMessage("Error"),
                                CQ.I18n.getMessage("Could not set additional properties for new page.")
                            );
                            if (failure) {
                                if (scope) {
                                    failure.call(scope);
                                } else {
                                    failure();
                                }
                            }
                        }
                    },
                    additionalPropsToSet,
                    this
                );
            } else {
                CQ.mcm.Util.showPropsDialog(contentPath, success, failure, scope);
            }
        }; 
        dialog.failure = function() {
            CQ.Ext.Msg.alert(
                CQ.I18n.getMessage("Error"),
                CQ.I18n.getMessage("Could not create page.")
            );
            if (failure) {
                if (scope) {
                    failure.call(scope);
                } else {
                    failure();
                }
            }
        };
        if (dialogTitle) {
            dialog.setTitle(dialogTitle);
        }
        dialog.show();
    },
    
    showPropsDialog: function(nodePath, success, failure, scope) {
        if (!nodePath.match("content$")) {
            nodePath = nodePath + "/jcr:content";
        }
        CQ.HTTP.get(
            nodePath + ".json",
            function(options, isSuccess, response) {
                if (isSuccess) {
                    var jsonData = CQ.Ext.util.JSON.decode(response.responseText);
                    if (jsonData) {
                        var resType = jsonData["sling:resourceType"];
                        if (resType) {
                            var dialogPath = "libs/" + resType + "/dialog.overlay.infinity.json";
                        	CQ.mcm.Util.openDialog(nodePath, 
                                dialogPath, false, function(propsDialog) {
                                    if (success) {
                                        if (scope) {
                                            success.call(scope, propsDialog);
                                        } else {
                                            success(propsDialog);
                                        }
                                    }
                            });
			scope.handleRefresh();
                        } else {
                            CQ.Ext.Msg.alert(
                                CQ.I18n.getMessage("Error"),
                                CQ.I18n.getMessage("Could not get resourceType of created node - seems to be empty.")
                            );
                            if (failure) {
                                if (scope) {
                                    failure.call(scope);
                                } else {
                                    failure();
                                }
                            }
                        }
                    } 
                    
                } else {
                    CQ.Ext.Msg.alert(
                        CQ.I18n.getMessage("Error"),
                        CQ.I18n.getMessage("Could not get content of created node.")
                    );
                    if (failure) {
                        if (scope) {
                            failure.call(scope);
                        } else {
                            failure();
                        }
                    }
                }
            },
            {},
            scope
        );

    }
};

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/

/**
 * Returns a description of a past or future date in relative terms.
 * Takes an optional parameter (default: 0) setting the threshold in ms which
 * is considered "Just now".
 *
 * Examples, where new Date().toString() == "Mon Nov 23 2009 17:36:51 GMT-0500 (EST)":
 *
 * new RelativeDateFormatter().format(new Date().toRelativeTime())
 * --> 'Just now'
 *
 * new RelativeDateFormatter().format(new Date("Nov 21, 2009").toRelativeTime())
 * --> '2 days ago'
 *
 * // One second ago
 * new RelativeDateFormatter().format(new Date("Nov 23 2009 17:36:50 GMT-0500 (EST)").toRelativeTime())
 * --> '1 second ago'
 *
 * // One second ago, now setting a now_threshold to 5 seconds
 * new RelativeDateFormatter().format(new Date("Nov 23 2009 17:36:50 GMT-0500 (EST)").toRelativeTime(5000))
 * --> 'Just now'
 *
 *
 * Contains portions by James F. Herdman, with the following license:
 *
 * The MIT License
 * Copyright (c) 2009 James F. Herdman
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE 
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN 
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
 
CQ.mcm.utils.RelativeDateFormatter = function() {};

CQ.mcm.utils.RelativeDateFormatter.prototype.format = function(val, now_threshold) {
  var delta = new Date() - val;
  var absDelta = Math.abs(delta);

  now_threshold = parseInt(now_threshold, 10);

  if (isNaN(now_threshold)) {
    now_threshold = 0;
  }

  if (absDelta <= now_threshold) {
    return 'Just now';
  }

  var units = null;
  var conversions = {
    millisecond: 1, // ms    -> ms
    second: 1000,   // ms    -> sec
    minute: 60,     // sec   -> min
    hour:   60,     // min   -> hour
    day:    24,     // hour  -> day
    month:  30,     // day   -> month (roughly)
    year:   12      // month -> year
  };

  for (var key in conversions) {
    if (absDelta < conversions[key]) {
      break;
    } else {
      units = key; // keeps track of the selected key over the iteration
      absDelta = absDelta / conversions[key];
    }
  }

  // pluralize a unit when the difference is greater than 1.
  absDelta = Math.floor(absDelta);
  if (absDelta !== 1) { units += "s"; }
  
  // switch future or past. 
  if (delta < 0) {
    return ["in", absDelta, units].join(" ");
  } else {
    return [absDelta, units, "ago"].join(" ");
  }
};

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/

CQ.Ext.namespace("CQ.event");

/**
 * CQ.event.EventAdmin offers a public event bus to CQ components to call each other without direct references.
 * It follows mostly the OSGi implementation http://www.osgi.org/javadoc/r4v42/org/osgi/service/event/package-summary.html
 * but adds some adaptions to follow JavaScript coding standards. 
 * See also: http://felix.apache.org/site/apache-felix-event-admin.html
 */

CQ.event.EventAdmin = function() {
    /*
     * eventHandler1 and 2 would have registered on topic "com"
     * eventHandler3 and 4 on topic "com/isv"
     * eventHandler5 on topic "com/isv/sometopic"
     * eventHandler6 on topic "com/isv/*"
     * eventHandler7 on topic "com/*"
     *
     * events for topic "com/isv" would go to handlers 3, 4, 7
     * events for topic "com/isv/sometopic" would go to handlers 5, 6, 7
     * events for topic "com" would go to handlers 1, 2
     */
    var _queues = {
/* Internal structure:
        "com": {
            _handlers: [ {handler: eventHandler1, context: context1}, {handler: eventHandler2, context: context2} ],
            "isv": {
                _handlers: [ {handler: eventHandler3, context: context3}, {handler: eventHandler4, context: context4} ],
                "sometopic": {
                    _handlers: [{handler: eventHandler5, context: context5}],
                },
                "*": [{handler: eventHandler6, context: context6}]
            },
            "*": [{handler: eventHandler7, context: context7}]
        }
*/    };
   
    return {
        sendEvent: function(event) {
            // trigger event synchronously

            // first call all handlers that are listening to the exact topic
            var queue = this.getQueue(event.topic);
            var handlers = queue._handlers;
            for(var i=0; i < handlers.length; i++) {
                try{
                    handlers[i].handler.call(handlers[i].context, event);
                }catch(e) {
                    // console.error(e);
                }
            }

            // then bubble up the queue
            queue = queue._parent;
            while(queue != undefined) {
                if(queue["*"] != undefined && queue["*"]._handlers != undefined) {
                    handlers = queue["*"]._handlers;
                    for(var j=0; j < handlers.length; j++) {
                        try{
                            handlers[j].handler.call(handlers[j].context, event);
                        }catch(e) {
                            // console.error(e);
                        }
                    }
                }
                queue = queue._parent;
            }
            
        },
        postEvent: function(event) {
            // trigger event asynchronously. Will not be implemented in version 1
        },
        registerEventHandler: function(topic, handler, context) {
            // register an event handler for a specific event topic
            if(typeof handler != "function")
                return;
            if(context == undefined)
                context = {};
            // TODO: topic has to be split up to find the correct queue
            this.getQueue(topic)._handlers.push({handler: handler, context: context})
        },
        
        //private?
        getQueue: function(topic) {
            var topicParts = topic.split("/");
            var queueParent = _queues;
            // create queue if it does not exists yet
            for(var i=0; i < topicParts.length; i++) {
                if(queueParent[topicParts[i]] == undefined) {
                    queueParent[topicParts[i]] = {
                        _handlers: new Array(),
                        _parent: queueParent
                    }
                }
                queueParent = queueParent[topicParts[i]];
            }

            return queueParent;
        }
    };
}();

CQ.event.Event = function(topic, properties) {
    return {
        topic: topic,
        properties: properties
    }
}

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/


/**
 * @class CQ.mcm.MCMAdmin
 * @extends CQ.security.SecurityAdmin
 * The Marketing Campaigns Managment console.
 * @constructor
 * Creates a new MCM Admin.
 * @param {Object} config The config object
 * @since 5.4
 */
CQ.mcm.MCMAdmin = CQ.Ext.extend(CQ.security.SecurityAdmin, {

    createUserDialogPath: "/libs/mcm/content/tools/createleaddialog",

    createGroupDialogPath: "/libs/mcm/content/tools/createlistdialog",

    editUserDialogPath: "/libs/mcm/content/tools/editleaddialog",

    editGroupDialogPath: "/libs/mcm/content/tools/editlistdialog",

    membersDialogPath: "/libs/mcm/content/tools/membersdialog",

    constructor: function(config) {
    
        var body = CQ.Ext.getBody();
        body.setStyle("margin", "0");
        if (CQ.Ext.isIE) {
            body.dom.scroll = "no";
        }
        else {
            body.setStyle("overflow", "hidden");
        }

        var admin = this;

        config = CQ.Util.applyDefaults(config, {
            "id": "cq-security"
        });

        this.id = config.id;
        window.CQ_SecurityAdmin = this;

        var items = [];
        var navItems = [];
        var counter = 0;
        var activeItem = config.deck.activeItem ? config.deck.activeItem : 0;
        
        this.navButtons = {};

        for (var i = 0; i < config.items.length; i++) {
            try {
                // a panel is put to the deck panel and a nav link is created using
                // the title of the item
                var title = config.items[i].title ? config.items[i].title : "";
                delete config.items[i].title;
                var widget = CQ.Util.build(config.items[i]);
                items.push(widget);
                var item = {
                    "text": title,
                    cls: "cq-mcmadmin-main-nav-item", 
                    cardItemId: widget.id
                };
                if(config.items[i].nonLeaf) {
                    item.leaf = false;
                    item.singleClickExpand = true;
                    item.name = "campaigns";
                    item["sling:resourceType"] = "mcmadmin/deck"
                    
                    this.campaignCardId = item.cardItemId;
                } else {
                    item.leaf = true;
                    item.name = widget.name;
                    item["sling:resourceType"] = "mcmadmin/nav"
                }
                if (config.items[i].id) {
                    this.navButtons[config.items[i].id] = item;
                    var pathName = item.name;
                    this.navButtons[config.items[i].id].toggle = function() {
                        CQ.event.EventAdmin.sendEvent( new CQ.event.Event( "com/day/mcm/SELECTIONCHANGE", {
                                path: "/content/" + pathName, 
                                resourceType: "mcmadmin/nav"
                            }) );
                    };
                }
                navItems.push(item);
                counter++;
            }
            catch (e) {}
        }
        delete config.items;
        
        this.navTree = new CQ.Ext.tree.TreePanel( {
                    "xtype":"treepanel",
                    "id":id + "-tree",
                    "cls":"cq-mcmadmin-tree",
                    border: false,
                    "animate":true,
                    rootVisible: false,
                    "loader": new CQ.Ext.tree.TreeLoader({
                        "requestMethod":"GET",
                        // uiProviders: { campaign: CQ.mcm.CampaignTreeNodeUI },  // official way, but we do it in own createNode
                        "dataUrl":"/libs/mcm/tree.json",
                        "baseParams": {
                            "ncc": 1,
                            "_charset_": "utf-8"
                        },
                        "baseAttrs": {
//                            "autoExpandMax":autoExpandMax,
                            "singleClickExpand":true
                        },
                        "listeners": {
                            "beforeload": function(loader, node) {
//                                console.log("before load", node, node.getPath("id"));

                                loader.dataUrl = CQ.HTTP.externalize(node.getPath("name") + ".mcmtree.json?");
                            }
                        },
                        createNode : function(attr) {
//                            console.log("create node", attr);
                            if (this.baseAttrs) {
                                CQ.Ext.applyIf(attr, this.baseAttrs);
                            }
                            
                            attr.label = attr.text;
                            
                            if(attr.type == "campaign" && attr.experiences != 0) {
                                attr.uiProvider = CQ.mcm.CampaignTreeNodeUI;
                            }
                            
                            var node;
                            if (attr.leaf) {
                                
                                node = new CQ.Ext.tree.TreeNode(attr);
                            } else {
                                attr.singleClickExpand = true;
                                node = new CQ.Ext.tree.AsyncTreeNode(attr);
                            }
                            return node;
                        }
                    }),
                    "root": {
                        nodeType: 'async',
                        text: 'invisible root',
                        expanded: true,
                        draggable: false,
                        name: 'content',
                        children: navItems
                    },
                    "listeners": {
                        selectionchange: function(tree) {
                            // show the correct panel for the selected tree node
                            var node = tree.getSelectionModel().getSelectedNode();
                            if(node.attributes["sling:resourceType"] == "mcmadmin/deck" || node.attributes["sling:resourceType"] == "mcmadmin/nav") { // we have one of the top level nodes
                                var cardItem = CQ.Ext.getCmp(node.attributes.cardItemId);
                                admin.deck.layout.setActiveItem( cardItem );
                                
                                // unhighlight the 'Campaigns' node if it is not selected
                                if(node.attributes["sling:resourceType"] == "mcmadmin/nav")
                                    tree.getRootNode().lastChild.getUI().removeClass("x-tree-selected");
                                
                            }else {
                                admin.deck.layout.setActiveItem(admin.campaignCardId);
                                // highlight the 'Campaigns' node as well
                                tree.getRootNode().lastChild.getUI().addClass("x-tree-selected");
                            }
                            
                            var eventPath = node.getPath("name");
                            if(admin.dontTriggerEvent != true) {
                                
                                if (eventPath == "/content/") {
                                    // only root part, not a real path. Better send null.
                                    eventPath = null;
                                }
                                CQ.event.EventAdmin.sendEvent( new CQ.event.Event( "com/day/mcm/SELECTIONCHANGE", {
                                    path: eventPath,
                                    label: node.attributes.label,
                                    resourceType: node.attributes["sling:resourceType"]
                                }) );
                            }
                            admin.dontTriggerEvent = false;

                            if (eventPath != null) {
                                CQ.Ext.History.add(eventPath);
                            }
                            
                        }
                    }
            
        });
        
        this.deck =  CQ.Util.build(CQ.Util.applyDefaults(config.deck, {
            "xtype": "panel",
            "layout": "card",
            "id": this.id + "-deck",
            "activeItem": 0,
            "region": "center",
            "border": false,
            "items": items
        }));
        delete config.deck;

        config = CQ.Util.applyDefaults(config, {
            "id": this.id,
            "layout": "border",
            "renderTo": CQ.Util.ROOT_ID,
            "items": [
                {
                    "id": "cq-header",
                    "xtype": "container",
                    "cls": this.id + "-header",
                    "autoEl": "div",
                    "region": "north",
                    "items": {
                        "xtype": "panel",
                        "border": false,
                        "layout": "column",
                        "cls": "cq-header-toolbar",
                        "items": [
                            new CQ.Switcher({}),
                            new CQ.UserInfo({}),
                            new CQ.HomeLink({})
                        ]
                    }
                },
                // todo: read from config (security/mcm)
                {
                    "id": this.id + "-nav",
                    "cls": "cq-security-nav",
                    "xtype": "panel",
                    "region": "west",
                    "width": CQ.security.themes.SecurityAdmin.NAV_WIDTH,
                    "layout": "border",
                    "border": false,
                    "items": {
                        "xtype": "panel",
                        "region": "center",
                        "autoScroll":true,
                        "margins": CQ.security.themes.SecurityAdmin.NAV_MARGINS,
                        "items": [this.navTree]
                    }
                },
                this.deck
            ]
        });

        // init component by calling super constructor
        CQ.security.SecurityAdmin.superclass.constructor.call(this, config);

        CQ.event.EventAdmin.registerEventHandler("com/day/mcm/REQSELECTIONCHANGE", this.reqSelectionChange, this);
        CQ.event.EventAdmin.registerEventHandler("com/day/mcm/SELECTIONCHANGE", this.selectionChange, this);
        CQ.event.EventAdmin.registerEventHandler("com/day/mcm/REFRESH", this.refresh, this);
        
        this.historyForm = CQ.Ext.get(CQ.Util.ROOT_ID).createChild({
            tag:    'form',
            action: '#',
            cls:    'x-hidden',
            id:     'mcm-history-form',
            children: [
              {
                tag: 'div',
                children: [
                  {
                    tag:  'input',
                    id:   CQ.Ext.History.fieldId,
                    type: 'hidden'
                  },
                  {
                    tag:  'iframe',
                    id:   CQ.Ext.History.iframeId
                  }
                ]
              }
            ]
        });

        CQ.Ext.History.init();
        CQ.Ext.History.on("change", this.historyChange, this);

        var anchor = CQ.HTTP.getAnchor(document.location.href);
        if (anchor && (anchor != '/content' && anchor != '/content/') ) {
            this.navTree.selectPath(anchor, "name");
            if(anchor == '/content/campaigns') {
                this.navTree.getRootNode().childNodes[3].expand();
            }
        }else {
            this.navTree.getRootNode().childNodes[0].select();

        }

    },
    callOnNodeForPath: function(path, callback, scope) {
        // calls the callback with the node found under path, expanding not yet expanded nodes on the go
        var pathSegments = path.replace("/content/", "").split("/");
        
        var recFunc = null;
        recFunc = function(node) {
            var done = false;

            if(node.findChild("name", pathSegments[0]) != null) {
                node = node.findChild("name", pathSegments[0]);
                pathSegments.shift();
            } else { 
                done = true;
            }
            if (!done && pathSegments.length ) {
                if (node.isExpandable() && !node.isExpanded()) {
                    node.expand(false, true, recFunc);
                } else {
                    recFunc(node);
                }
            } else {
                done = true;
            }
            
            if (done) {
                if (scope != null) {
                    scope.callback(node);
                } else {
                    callback(node);
                }
            }
        }
        var rootNode = this.navTree.getRootNode();
        if (pathSegments) {
            if (rootNode.isExpandable() && !rootNode.isExpanded()) {
                rootNode.expand(false, true, recFunc);
            } else {
                recFunc(rootNode);
            }
        } else {
            if (scope != null) {
                scope.callback(rootNode);
            } else {
                callback(rootNode);
            }
        }
    },
    reqSelectionChange: function(event) {
        // this handler uses the path from the event and the node data to
        // raise a selectionChange event. This is helpful because subviews
        // don't have the type data stored in the nodes. On the other hand this
        // is required to react to selection changes.
        this.callOnNodeForPath(event.properties.path, function(node) {
        
            CQ.event.EventAdmin.sendEvent( new CQ.event.Event( "com/day/mcm/SELECTIONCHANGE", {
                path: node.getPath("name"),
                label: node.attributes.label,
                resourceType: node.attributes["sling:resourceType"]
            }) );
        });
    },
    selectionChange: function(event) {
        if ( (! this.navTree.getSelectionModel().getSelectedNode()) 
                || this.navTree.getSelectionModel().getSelectedNode().getPath() != event.properties.path) {
            
            // this is called via the event, thus prevent to send it again.
            this.dontTriggerEvent = true;
            this.navTree.selectPath(event.properties.path, "name");
        }
    },
    historyChange: function(token) {
        if (this.navTree.getSelectionModel().getSelectedNode()) {
            if(this.navTree.getSelectionModel().getSelectedNode().getPath() != token) {
                this.navTree.selectPath(token, "name");
            }
        }
    },
    refresh: function(event) {
        if (this.refreshing) return;
        this.refreshing = true;
        
        var selectedPath = null;
        if (this.navTree.getSelectionModel().getSelectedNode()) {
            selectedPath = this.navTree.getSelectionModel().getSelectedNode().getPath();
        }
        
        var node = this.navTree.root;
        if (event.properties.path) {
            var pathSegments = event.properties.path.replace("/content/", "").split("/");
            for(var i=0; i < pathSegments.length; i++) {
                if(node.findChild("name", pathSegments[i]) != null)
                    node = node.findChild("name", pathSegments[i]);
            }
        }
        
        var that = this;
        var finalizer = function(){
            if (selectedPath) {
                that.navTree.selectPath(selectedPath, "name");
            }
            that.refreshing = false;
        };
        if (node.reload) {            
            node.reload(finalizer);
        } else {
            if (node.parentNode.reload) {
                node.parentNode.reload(finalizer);
            } else {
                that.refreshing = false;
            }
        }
    },

    // private
    getMsg: function(msg, snippets) {
        switch(msg) {
            // add to group
            case this.ADD_TO_GROUP_TITLE:            return CQ.I18n.getMessage("Add to List", [], "marketing terminology");
            case this.ADD_THE_FOLLOWING_USER:        return CQ.I18n.getMessage("Add the following lead ...", [], "marketing terminology");
            case this.ADD_THE_FOLLOWING_X_USERS:     return CQ.I18n.getMessage("Add the following {0} leads ...", snippets, "marketing terminology");
            case this.ADD_THE_FOLLOWING_GROUP:       return CQ.I18n.getMessage("Add the following list ...");
            case this.ADD_THE_FOLLOWING_X_GROUPS:    return CQ.I18n.getMessage("Add the following {0} lists ...", snippets);
            case this.TO_THE_FOLLOWING_GROUP:        return CQ.I18n.getMessage("... to the following list:", [], "Add lead X to the following list / marketing terminology");
            case this.MERGE_THE_FOLLOWING_GROUP:     return CQ.I18n.getMessage("Merge the following list ...", [], "marketing terminology");
            case this.WITH_GROUP:                    return CQ.I18n.getMessage("... with list {0}", snippets, "Merge list X with list Y");

            // quick views
            case this.X_NOT_MEMBER_OF_ANY:           return CQ.I18n.getMessage("{0} is not member of any list.", snippets, "marketing terminology");
            case this.X_IS_MEMBER_OF:                return CQ.I18n.getMessage("{0} is member of the following list:", snippets, "marketing terminology");
            case this.X_IS_MEMBER_OF_Y_GROUPS:       return CQ.I18n.getMessage("{0} is member of the following {1} lists:", snippets, "marketing terminology");

            case this.GROUP_X_NOT_MEMBER_OF_ANY:     return CQ.I18n.getMessage("The list {0} is not member of any other list.", snippets, "marketing terminology");
            case this.GROUP_X_IS_MEMBER_OF:          return CQ.I18n.getMessage("The list {0} is member of the following list:", snippets, "marketing terminology");
            case this.GROUP_X_IS_MEMBER_OF_Y_GROUPS: return CQ.I18n.getMessage("The list {0} is member of the following {1} lists:", snippets, "marketing terminology");

            case this.REMOVE_MEMBERSHIP_TITLE:       return CQ.I18n.getMessage("Remove List Membership");
            case this.REMOVE_USER_FROM_GROUP:        return CQ.I18n.getMessage("Are you sure to remove lead {0} from list {1}?", snippets);
            case this.REMOVE_GROUP_FROM_GROUP:       return CQ.I18n.getMessage("Are you sure to remove list {0} from list {1}?", snippets);

            // actions
            case this.DELETE_USERS_TITLE:            return CQ.I18n.getMessage("Delete Lead", [], "marketing terminology");
            case this.DELETE_USER:                   return CQ.I18n.getMessage("You are going to delete the following lead:", [], "marketing terminology");
            case this.DELETE_USERS:                  return CQ.I18n.getMessage("You are going to delete the following leads:", [], "marketing terminology");

            case this.DELETE_GROUPS_TITLE:           return CQ.I18n.getMessage("Delete Lists", [], "marketing terminology");
            case this.DELETE_GROUP:                  return CQ.I18n.getMessage("You are going to delete the following list:", [], "marketing terminology");
            case this.DELETE_GROUPS:                 return CQ.I18n.getMessage("You are going to delete the following lists:", [], "marketing terminology");

            case this.ACTIVATE_USERS_TITLE:          return CQ.I18n.getMessage("Activate Lead", [], "marketing terminology");
            case this.ACTIVATE_USER:                 return CQ.I18n.getMessage("You are going to activate the following lead:", [], "marketing terminology");
            case this.ACTIVATE_USERS:                return CQ.I18n.getMessage("You are going to activate the following leads:", [], "marketing terminology");

            case this.ACTIVATE_GROUPS_TITLE:         return CQ.I18n.getMessage("Activate Lists", [], "marketing terminology");
            case this.ACTIVATE_GROUP:                return CQ.I18n.getMessage("You are going to activate the following list:", [], "marketing terminology");
            case this.ACTIVATE_GROUPS:               return CQ.I18n.getMessage("You are going to activate the following lists:", [], "marketing terminology");

            case this.DEACTIVATE_USERS_TITLE:        return CQ.I18n.getMessage("Deactivate Leads", [], "marketing terminology");
            case this.DEACTIVATE_USER:               return CQ.I18n.getMessage("You are going to deactivate the following lead:", [], "marketing terminology");
            case this.DEACTIVATE_USERS:              return CQ.I18n.getMessage("You are going to deactivate the following leads:", [], "marketing terminology");

            case this.DEACTIVATE_GROUPS_TITLE:       return CQ.I18n.getMessage("Deactivate Lists", [], "marketing terminology");
            case this.DEACTIVATE_GROUP:              return CQ.I18n.getMessage("You are going to deactivate the following list:", [], "marketing terminology");
            case this.DEACTIVATE_GROUPS:             return CQ.I18n.getMessage("You are going to deactivate the following lists:", [], "marketing terminology");

            case this.MEMBERS_TITLE:                 return CQ.I18n.getMessage("Leads of List {0}", snippets);
            case this.REMOVE_MEMBER:                 return CQ.I18n.getMessage("You are going to remove the following lead from {0}", snippets);
            case this.REMOVE_MEMBERS:                return CQ.I18n.getMessage("You are going to remove the following leads from {0}", snippets);

            case this.FAILED_TO_CREATE_USER:         return CQ.I18n.getMessage("Failed to create lead", [], "marketing terminology");
            case this.FAILED_TO_CREATE_GROUP:        return CQ.I18n.getMessage("Failed to create list", [], "marketing terminology");
            case this.EMAIL_OR_ID_MISSING:           return CQ.I18n.getMessage("Either Mail or ID should be specified while creation.");

            default: return "";
        }
    }

});

CQ.Ext.reg("mcmadmin", CQ.mcm.MCMAdmin);



CQ.mcm.MCMAdmin.LIST_DETAILS_ROWS = {
    "csv": {
        "id": "csv",
        "label": "Imported CSV"
    }

};

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/


/**
 * @deprecated: please use Adobe Campaign instead, as of AEM 6.1 (CQ-33156)
 */
CQ.mcm.MCMAdmin.importCSV = function() {
    var dialog = new CQ.mcm.ImportCsvWizard();
    CQ.security.SecurityAdmin.importCSV(dialog);
};

CQ.mcm.MCMAdmin.sendNewsletter = function() {
    var sel = window.CQ_SecurityAdmin.groupsGrid.getSelectionModel().getSelections()[0];
    var dialog = new CQ.mcm.SendNewsletterWizard({
        "selectListMode": false,
        "height": 300,
        "width": 460,
        "params": {
            "sling:bg": false
        },
        "items": {
            "xtype": "tabpanel",
            "items": [{
                "xtype": "panel",
                "title": CQ.I18n.getMessage("Select newsletter"),
                "items": [{
                    "xtype": "pathfield",
                    "name": "newsletter",
                    "rootTitle": CQ.I18n.getMessage("Campaigns"),
                    "rootPath": "/content/campaigns",
                    "predicate": "newsletter",
                    "allowBlank": false,
                    "fieldLabel": CQ.I18n.getMessage("Newsletter"),
                    "browseDialogCfg": {
                        "title": CQ.I18n.getMessage("Select Newsletter")
                    }
                }]
            },{
                "xtype": "panel",
                "title": CQ.I18n.getMessage("Finish", [], "Last step of a wizard"),
                "items": [{
                    "xtype": "static",
                    "bold": true,
                    "html": CQ.I18n.getMessage("Setup Complete") + "<br><br>"
                },{
                    "xtype": "static",
                    "html": CQ.I18n.getMessage("Click the Send button below to send the selected newsletter to {0} leads of list {1}.", ["<b>"+sel.get("membersTotal")+"</b>", "<b>" + CQ.shared.XSS.getXSSRecordPropertyValue(sel, "name") + "</b>"])
                }]
            }]
        }
    });
    dialog.show();
    dialog.setRecipientsCnt(sel.get("membersTotal"));
    dialog.initWizard(sel.get("id"));
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
 * @class CQ.mcm.Dashboard
 * @extends CQ.Ext.Panel
 * The dashboard of the Marketing Campaigns Managment console.
 * @constructor
 * Creates a new Dashboard.
 * @param {Object} config The config object
 * @since 5.4
 */
CQ.mcm.Dashboard = CQ.Ext.extend(CQ.Ext.Panel, {

    constructor: function(config) {

        var db = this;

        var listsStoreConfig = CQ.Util.applyDefaults({}, {
            "autoLoad": true,
            "proxy": new CQ.Ext.data.HttpProxy({
                "url": "/libs/cq/security/content/authorizableSearch.json",
                "method": "GET"
            }),
            "reader": new CQ.Ext.data.JsonReader(
                {
                    "totalProperty": "results",
                    "root": "authorizables",
                    "id": "home"
                },
                CQ.Ext.data.Record.create([
                    {
                        "name": "name",
                        "mapping": CQ.shared.XSS.getXSSPropertyName("name")
                    },
                    {
                        "name": "home"
                    },
                    {
                        "name": "membersTotal"
                    }
                ])
            ),
            "baseParams": {
                "_charset_": "utf-8",
                "ml": 2000, // membersLimit
                "props": "name,home,membersTotal",
                "query": new CQ.security.search.Query(CQ.Util.applyDefaults(config.queryCfg, {
                    "category": "mcm",
                    "selector": "group",
                    "totalMax": 10,
                    "sortBy": "@cq:lastModified",
                    "sortDir": "desc"
                })).getString()
            }
        });

        var segmentsStoreConfig = CQ.Util.applyDefaults({}, {
            "autoLoad": true,
            "proxy": new CQ.Ext.data.HttpProxy({
                "url": "/bin/wcm/contentfinder/page/view.json/content",
                "method": "GET"
            }),
            "reader": new CQ.Ext.data.JsonReader(
                {
                    "root": "hits",
                    "id": "name"
                },
                CQ.Ext.data.Record.create([
                    {
                        "name": "title",
                        "mapping": CQ.shared.XSS.getXSSPropertyName("title")
                    },
                    {
                        "name": "lastModified"
                    },
                    {
                        "name": "path"
                    }
                ])
            ),
            "baseParams": {
                "_charset_": "utf-8",
                "query": "path:/etc/segmentation",
                "type": "cq:Page"
            }
        });

        var reportsStoreConfig = CQ.Util.applyDefaults({}, {
            "autoLoad": true,
            "proxy": new CQ.Ext.data.HttpProxy({
                "url": "/bin/wcm/contentfinder/page/view.json/content",
                "method": "GET"
            }),
            "reader": new CQ.Ext.data.JsonReader(
                {
                    "root": "hits",
                    "id": "name"
                },
                CQ.Ext.data.Record.create([
                    {
                        "name": "title",
                        "mapping": CQ.shared.XSS.getXSSPropertyName("title")
                    },
                    {
                        "name": "lastModified"
                    },
                    {
                        "name": "path"
                    }
                ])
            ),
            "baseParams": {
                "_charset_": "utf-8",
                "query": "path:/etc/reports",
                "type": "cq:Page"
            }
        });

        var campaignsStoreConfig = CQ.Util.applyDefaults({}, {
            "autoLoad": true,
            "proxy": new CQ.Ext.data.HttpProxy({
                "url": "/bin/wcm/contentfinder/page/view.json/content",
                "method": "GET"
            }),
            "reader": new CQ.Ext.data.JsonReader(
                {
                    "root": "hits",
                    "id": "name"
                },
                CQ.Ext.data.Record.create([
                    {
                        "name": "title",
                        "mapping": CQ.shared.XSS.getXSSPropertyName("title")
                    },
                    {
                        "name": "lastModified"
                    },
                    {
                        "name": "path"
                    }
                ])
            ),
            "baseParams": {
                "_charset_": "utf-8",
                "query": "path:/content/campaigns",
                "type": "cq:Page"
            }
        });

        CQ.Util.applyDefaults(config,  {
            "xtype": "panel",
            "layout": "border",
            "border": false,
            "items": {
                "xtype": "panel",
                "region": "center",
                "margins": "5 5 5 5",
                "padding": "26px 16px 16px 16px",
                "border": true,
                "autoScroll": true,
                "cls": "cq-security-dashboard",
                "items": [
                    {
                        "xtype": "panel",
                        "layout": "hbox",
                        "autoHeight": true,
                        "border": false,
                        "items": [
                            // @deprecated: please use Adobe Campaign instead, as of AEM 6.1 (CQ-33156)
                            this.listsPanel = new CQ.Ext.Panel({
//                                "title": "Lists",
                                "flex": 1,
                                "height": 240,
                                "autoScroll": true,
                                "margins": "0 20 20 0",
                                "tbar": [
                                    CQ.I18n.getMessage("Lists"),
                                    "->",
                                        "-",
                                    {
                                        "text": CQ.I18n.getMessage("New List..."),
                                        "handler": function() {
                                            CQ.security.SecurityAdmin.createGroup();
                                        }
                                    },
                                    {
                                        "text": CQ.I18n.getMessage("Import Leads..."),
                                        "handler": function() {
                                            CQ.mcm.MCMAdmin.importCSV();
                                        }
                                    },
                                    "-",
                                    {
                                        "iconCls": "x-tbar-loading",
                                        "handler": function() {db.listsDataView.getStore().reload();}
                                    }
                                ],
                                "items": [
                                    this.listsDataView = new CQ.Ext.DataView({
                                        "cls": "cq-security-dashboard-dataview",
                                        "title": "Lists",
                                        "autoHeight": true,
//                                        "loadingText": CQ.I18n.getMessage("Loading content..."),
                                        "multiSelect": false,
                                        "singleSelect": true,
                                        "overClass": "x-view-over",
                                        "emptyText": CQ.I18n.getMessage("No items to display"),
                                        "tpl":
                                            '<table border="0" width="100%"><tbody>' +
                                            '<tpl for=".">' +
                                                '<tr class="row"><td>' +
                                                    '<span class="cq-security-grid-link" onclick="CQ.security.SecurityAdmin.showGroupInGrid(\'{home}\');">{name}</span>' +
                                                '</td><td class="cq-security-dashboard-right">' +
                                                    '{membersTotal}' +
                                                '</td></tr>' +
                                            '</tpl>' +
                                            '</tbody></table>',
                                        "itemSelector": ".row",
                                        "store": new CQ.Ext.data.GroupingStore(listsStoreConfig),
                                        "prepareData": function(data) {
                                            var max = db.listsDataView.getStore().baseParams.ml;
                                            if (data.membersTotal == max) {
                                                data.membersTotal = CQ.security.SecurityAdmin.formatMax(max);
                                            }
                                            return data;
                                        }
                                    })
                                ]
                            }),
                            this.reportsPanel = new CQ.Ext.Panel({
                                "flex": 1,
//                                "title": "Reports",
                                "height": 240,
                                "autoScroll": true,
                                "tbar": [
                                    CQ.I18n.getMessage("Reports"),
                                    "->",
                                    {
                                    "iconCls": "x-tbar-loading",
                                    "handler": function() {db.reportsDataView.getStore().reload();}
                                }],
                                "items": [
                                    this.reportsDataView = new CQ.Ext.DataView({
                                        "cls": "cq-security-dashboard-dataview",
                                        "autoHeight": true,
//                                        "loadingText": CQ.I18n.getMessage("Loading content..."),
                                        "multiSelect": false,
                                        "singleSelect": true,
                                        "overClass": "x-view-over",
                                        "emptyText": CQ.I18n.getMessage("No items to display"),
                                        "tpl":
                                            '<table border="0" width="100%"><tbody>' +
                                            '<tpl for=".">' +
                                                '<tr class="row"><td>' +
                                                    '<span class="cq-security-grid-link" onclick="CQ.wcm.SiteAdmin.openPage(\'{path}\');">{title}</span>' +
                                                '</td><td class="cq-security-dashboard-right">' +
                                                    '<span title="{fullMod}">{mod}</span>' +
                                                '</td></tr>' +
                                            '</tpl>' +
                                            '</tbody></table>',
                                        "itemSelector": ".row",
                                        "store": new CQ.Ext.data.GroupingStore(reportsStoreConfig),
                                        "prepareData": function(data) {
                                            var fd = ""; // formatted date string
                                            try {
                                                // 2010-01-25 22:12:45
                                                var tmp = data.lastModified.split(" ");
                                                var d0 = tmp[0].split("-");
                                                var d1 = tmp[1].split(":");
                                                var d = new Date(Date.UTC(d0[0], d0[1] - 1, d0[2], d1[0], d1[1], d1[2]));
                                                var now = new Date();
                                                if (CQ.Date.isToday(d, now)) fd = CQ.Date.TODAY;
                                                else if (CQ.Date.isYesterday(d, now)) fd = CQ.Date.YESTERDAY;
                                                else if (CQ.Date.isThisWeek(d, now)) fd = CQ.Date.THIS_WEEK;
                                                else if (CQ.Date.isLastWeek(d, now)) fd = CQ.Date.LAST_WEEK;
                                                else if (CQ.Date.isThisMonth(d, now)) fd = CQ.Date.THIS_MONTH;
                                                else if (CQ.Date.isThisYear(d, now)) fd = d.format(CQ.I18n.getMessage("F d", null, "Date format for ExtJS: http://dev.sencha.com/deploy/ext-3.3.1/docs/?class=Date. Make sure the Japanese translation is m月d日"));
                                                else fd = d.format(CQ.I18n.getMessage("d-M-Y", null, "Date format for ExtJS: http://dev.sencha.com/deploy/ext-3.3.1/docs/?class=Date. Make sure the Japanese translation is Y年m月d日"));

                                                //data.fullMod = CQ.wcm.SiteAdmin.formatDate(d); (error in date format, does not match siteadmin dates)
                                                
                                                //fix:date format for UTC and GMT time
                                                data.fullMod = CQ.wcm.SiteAdmin.formatDate(new Date(d0[0], d0[1] - 1, d0[2])).replace("00:00","") + d1[0]+":"+d1[1];
                                            }
                                            catch (e) {
                                                // invalid date, e.g. new annotation
                                            }
                                            data.mod = fd;
                                            return data;
                                        }
                                    })
                                ]
                            })
                        ]
                    },
                    {
                        "xtype": "panel",
                        "layout": "hbox",
                        "border": false,
                        "flex": 1,
                        "items": [
                            this.segmentsPanel = new CQ.Ext.Panel({
//                                "title": "Segments",
                                "flex": 1,
                                "height": 240,
                                "autoScroll": true,
                                "margins": "0 20 0 0",
                                "tbar": [
                                    CQ.I18n.getMessage("Segments"),
                                    "->",
                                    {
                                    "iconCls": "x-tbar-loading",
                                    "handler": function() {db.segmentsDataView.getStore().reload();}
                                }],
                                "items": [
                                    this.segmentsDataView = new CQ.Ext.DataView({
                                        "cls": "cq-security-dashboard-dataview",
                                        "autoHeight": true,
//                                        "loadingText": CQ.I18n.getMessage("Loading content..."),
                                        "multiSelect": false,
                                        "singleSelect": true,
                                        "overClass": "x-view-over",
                                        "emptyText": CQ.I18n.getMessage("No items to display"),
                                        "tpl":
                                            '<table border="0" width="100%"><tbody>' +
                                            '<tpl for=".">' +
                                                '<tr class="row"><td>' +
                                                    '<span class="cq-security-grid-link" onclick="CQ.wcm.SiteAdmin.openPage(\'{path}\');">{title}</span>' +
                                                '</td><td class="cq-security-dashboard-right">' +
                                                    '<span title="{fullMod}">{mod}</span>' +
                                                '</td></tr>' +
                                            '</tpl>' +
                                            '</tbody></table>',
                                        "itemSelector": ".row",
                                        "store": new CQ.Ext.data.GroupingStore(segmentsStoreConfig),
                                        "prepareData": function(data) {
                                            var fd = ""; // formatted date string
                                            try {
                                                // 2010-01-25 22:12:45
                                                var tmp = data.lastModified.split(" ");
                                                var d0 = tmp[0].split("-");
                                                var d1 = tmp[1].split(":");
                                                var d = new Date(Date.UTC(d0[0], d0[1] - 1, d0[2], d1[0], d1[1], d1[2]));
                                                var now = new Date();
                                                if (CQ.Date.isToday(d, now)) fd = CQ.Date.TODAY;
                                                else if (CQ.Date.isYesterday(d, now)) fd = CQ.Date.YESTERDAY;
                                                else if (CQ.Date.isThisWeek(d, now)) fd = CQ.Date.THIS_WEEK;
                                                else if (CQ.Date.isLastWeek(d, now)) fd = CQ.Date.LAST_WEEK;
                                                else if (CQ.Date.isThisMonth(d, now)) fd = CQ.Date.THIS_MONTH;
                                                else if (CQ.Date.isThisYear(d, now)) fd = d.format(CQ.I18n.getMessage("F d", null, "Date format for ExtJS: http://dev.sencha.com/deploy/ext-3.3.1/docs/?class=Date. Make sure the Japanese translation is m月d日"));
                                                else fd = d.format(CQ.I18n.getMessage("d-M-Y", null, "Date format for ExtJS: http://dev.sencha.com/deploy/ext-3.3.1/docs/?class=Date. Make sure the Japanese translation is Y年m月d日"));

                                               //data.fullMod = CQ.wcm.SiteAdmin.formatDate(d); (error in date format, does not match siteadmin dates)
                                                
                                                //fix:date format for UTC and GMT time
                                                data.fullMod = CQ.wcm.SiteAdmin.formatDate(new Date(d0[0], d0[1] - 1, d0[2])).replace("00:00","") + d1[0]+":"+d1[1];
                                            }
                                            catch (e) {
                                                // invalid date, e.g. new annotation
                                            }
                                            data.mod = fd;
                                            return data;
                                        }
                                    })
                                ]
                            }),
                            this.campaignsPanel = new CQ.Ext.Panel({
//                                "title": "Campaigns",
                                "flex": 1,
                                "height": 240,
                                "autoScroll": true,
                                "tbar": [
                                    CQ.I18n.getMessage("Campaigns"),
                                    "->",
                                    {
                                    "iconCls": "x-tbar-loading",
                                    "handler": function() {db.campaignsDataView.getStore().reload();}
                                }],
                                "items": [
                                    this.campaignsDataView = new CQ.Ext.DataView({
                                        "cls": "cq-security-dashboard-dataview",
                                        "autoHeight": true,
//                                        "loadingText": CQ.I18n.getMessage("Loading content..."),
                                        "multiSelect": false,
                                        "singleSelect": true,
                                        "overClass": "x-view-over",
                                        "emptyText": CQ.I18n.getMessage("No items to display"),
                                        "tpl":
                                            '<table border="0" width="100%"><tbody>' +
                                            '<tpl for=".">' +
                                                '<tpl if="values.isOverview != true">' +
                                                '<tr class="row"><td>' +
                                                    '<span class="cq-security-grid-link" onclick="CQ.wcm.SiteAdmin.openPage(\'{path}\');">{title}</span>' +
                                                '</td><td class="cq-security-dashboard-right">' +
                                                    '<span title="{fullMod}">{mod}</span>' +
                                                '</td></tr>' +
                                                '</tpl>' +
                                            '</tpl>' +
                                            '</tbody></table>',
                                        "itemSelector": ".row",
                                        "store": new CQ.Ext.data.GroupingStore(campaignsStoreConfig),
                                        "prepareData": function(data) {
                                            if (data.path.split("/").length < 5) {
                                                // do not list campaigns overview pages
                                                // e.g. /content/campaigns/geometrixx
                                                data.isOverview = true;
                                            }
                                            var fd = ""; // formatted date string
                                            try {
                                                // 2010-01-25 22:12:45
                                                var lm = data.lastModified;
                                               
                                                var tmp = data.lastModified.split(" ");
                                                var d0 = tmp[0].split("-");
                                                var d1 = tmp[1].split(":");
                                                
                                                var d = new Date(Date.UTC(d0[0], d0[1] - 1, d0[2], d1[0], d1[1], d1[2]));
                                                
                                                var now = new Date();
                                                if (CQ.Date.isToday(d, now)) fd = CQ.Date.TODAY;
                                                else if (CQ.Date.isYesterday(d, now)) fd = CQ.Date.YESTERDAY;
                                                else if (CQ.Date.isThisWeek(d, now)) fd = CQ.Date.THIS_WEEK;
                                                else if (CQ.Date.isLastWeek(d, now)) fd = CQ.Date.LAST_WEEK;
                                                else if (CQ.Date.isThisMonth(d, now)) fd = CQ.Date.THIS_MONTH;
                                                else if (CQ.Date.isThisYear(d, now)) fd = d.format(CQ.I18n.getMessage("F d", null, "Date format for ExtJS: http://dev.sencha.com/deploy/ext-3.3.1/docs/?class=Date. Make sure the Japanese translation is m月d日"));
                                                else fd = d.format(CQ.I18n.getMessage("d-M-Y", null, "Date format for ExtJS: http://dev.sencha.com/deploy/ext-3.3.1/docs/?class=Date. Make sure the Japanese translation is Y年m月d日"));
                                                //data.fullMod = CQ.wcm.SiteAdmin.formatDate(d); (error in date format, does not match siteadmin dates)
                                                
                                                //fix:date format for UTC and GMT time
                                                data.fullMod = CQ.wcm.SiteAdmin.formatDate(new Date(d0[0], d0[1] - 1, d0[2])).replace("00:00","") + d1[0]+":"+d1[1];
                                                
                                            }
                                            catch (e) {
                                                // invalid date, e.g. new annotation
                                            }
                                            data.mod = fd;
                                            return data;
                                        }
                                    })
                                ]
                            })
                        ]

                    }
                ]
            }
        });

        CQ.mcm.Dashboard.superclass.constructor.call(this, config);
    }

});

CQ.Ext.reg("mcmdashboard", CQ.mcm.Dashboard);

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
 * @class CQ.mcm.ImportCsvWizard
 * @extends CQ.Dialog
 * The ImportCsvWizard is a step-by-step wizard to import leads by comma separated values.
 * @constructor
 * Create a new ImportCsvWizard
 * @param {Object} config The config object
 * @since 5.4
 */
CQ.mcm.ImportCsvWizard = CQ.Ext.extend(CQ.security.ImportCsvWizard, {

    // private
    getMsg: function(msg, snippets) {
        switch(msg) {
            case this.TITLE:                    return CQ.I18n.getMessage("Import Leads");

            case this.PROGRESS_PREVIEW_USERS:   return CQ.I18n.getMessage("Preview Leads");
            case this.PROGRESS_SELECT_GROUP:    return CQ.I18n.getMessage("Select List");

            case this.FIRST_COLUMN_IS_HEADER:  return CQ.I18n.getMessage("First column will be used to create the lead IDs");

            case this.ADD_USERS_TO_FOLLOWING:   return CQ.I18n.getMessage("Add the imported leads to the following list:");
            case this.LEAVE_EMPTY:              return CQ.I18n.getMessage("If empty the imported leads will not be added to any list.");

            default: return "";
        }
    }

});

CQ.Ext.reg("mcmimportcsvwizard", CQ.mcm.ImportCsvWizard);


/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/


/**
 * @class CQ.mcm.SendNewsletterWizard
 * @extends CQ.Dialog
 * @constructor
 * Create a Wizard to send newsletters.
 * @param {Object} config The config object
 * @since 5.4
 */
CQ.mcm.SendNewsletterWizard = CQ.Ext.extend(CQ.Dialog, {

    activePage: 0,

    wizPanel: null,

    actListId: null,

    dataView: null,

    progressStore: null,

    progressTemplate: null,

    progressPanel: null,

    loadMask: null,

    recipientsCnt:0,

    bgThreshold:0,

    constructor: function(config) {
        var dlg = this;

        //----------------------------------------------------------------------
        // Progress Bar
        //----------------------------------------------------------------------

        // we need some text, otherwise the bottom bar is rendered incorrectly
        var progressStore = [];

        this.progressStore = progressStore;

        var progressTemplate = new CQ.Ext.XTemplate(
                '<div class="x-toolbar x-small-editor">',
                    '<table cellspacing="0"><tr>',
                    '<tpl for=".">',
                        '<tpl if="values.idx != 0">',
                            '<td><span class="wiz-sep">&rarr;</span></td>',
                        '</tpl>',
                        '<td><span class="wiz-step {[this.isActive(values.idx) ? "wiz-step-active" : ""]}">{#}. {title}</span></td>',
                    '</tpl>',
                    '</table>',
                '</div>',
                {
                    isActive: function(idx) {
                        return idx == dlg.activePage;
                    }
                });
        this.progressTemplate = progressTemplate;

        var progressPanel = new CQ.Ext.Panel({
            cls: "cq-wizard-progress",
            border: false,
            html: progressTemplate.apply(progressStore)
        });
        this.progressPanel = progressPanel;

        //----------------------------------------------------------------------
        // Wizard Panel
        //----------------------------------------------------------------------

        var wizPanel = new CQ.Ext.Panel({
//            id: "cq-createsite-wizpanel",
            layout:'card',
            deferredRender: false,
//            plain: CQ.themes.Dialog.TABPANEL_PLAIN,
            border: false,
            stateful: false,
            activeItem: 0, // make sure the active item is set on the container config!
            bbar: progressPanel,
            defaults: {
                // applied to each contained panel
                border:false
            }
        });
        this.wizPanel = wizPanel;

        //----------------------------------------------------------------------
        // Dialog Panel
        //----------------------------------------------------------------------

        this.prevButton = new CQ.Ext.Button({
            "text": CQ.I18n.getMessage("Prev"),
            "cls": "cq-btn-prev",
            "disabled": true/*,
            "minWidth": CQ.themes.Dialog.MIN_BUTTON_WIDTH*/
        });

        this.nextButton = new CQ.Ext.Button({
            "text": CQ.I18n.getMessage("Next"),
            "cls": "cq-btn-next",
            "disabled": true/*,
            "minWidth": CQ.themes.Dialog.MIN_BUTTON_WIDTH*/
        });
        var org = {"items":config.items} ;
        config.items = [wizPanel];
        config = CQ.Util.applyDefaults(config, {
            "title":CQ.I18n.getMessage("Send Newsletter"),
            "formUrl":CQ.mcm.utils.Newsletter.DEFAULT_NEWLETTER_PATH
        });
        config = CQ.Util.applyDefaults(config, {
//            "id":"cq-createsitewizard",
            "params": {
                "_charset_":"utf-8"
            },
            "height": 560,
            "width": 600,
            "bgThreshold":CQ.mcm.SendNewsletterWizard.DEFAULT_BG_THRESHOlD
        });

        config.buttons = [
            this.prevButton,
            this.nextButton,
            CQ.Dialog.CANCEL
        ];

        CQ.mcm.SendNewsletterWizard.superclass.constructor.call(this, config);
        this.processPanels(org);
        this.on("beforesubmit", this.selectSyncMode);
        
        
        this.on("loadcontent", function(dlgSelf, records, opts, success) {
            if (success) {
                if(records && records[0]) {
                    // populate the letter recipient with the default value
                    var defaultRecipientList = records[0].get("defaultRecipientList");
                    var comboBox = this.findById("member-list-combo-box");
                    if (comboBox) {
                        defaultRecipientList = defaultRecipientList.substring(defaultRecipientList.lastIndexOf("/") + 1);
                        comboBox.setValue(defaultRecipientList);
                        dlg.loadListRecipientsOverlay(defaultRecipientList);
                    }
                }
            }
        });
    },

    loadListRecipientsOverlay: function(recordId) {
        var target = this.findById('member-list');
        if(target) {
            if (recordId) {
                CQ.mcm.utils.Newsletter.loadMailingListMembers(target, recordId, this);
            }
        }
    },

    loadContent: function(data) {
        // this initialized the dialog
        // loadContent is solely called from newsletter page (MCM Admin calls initWizard directly)
        this.initWizard(data, true);
        CQ.mcm.SendNewsletterWizard.superclass.loadContent.call(this, data);
    },

    initWizard: function(path, isSelectListMode) {
        if (isSelectListMode) {
            // dialog on newsletter page: newsletter given
            this.addParams({'newsletter':path});
        }
        else {
            // dialog in MCM Admin: list given
            this.addParams({'letterRecipient':path});
        }
        this.activePage = 0;
        this.actListId = null;
        this.wizPanel.layout.setActiveItem(0);
        this.doLayout();
        this.updateButtons();
    },

    navHandler: function(d) {
        var num = this.wizPanel.items.getCount();
        var idx = this.activePage + d;
        if (idx == num) {
            this.ok();
        } else if (idx >= 0 && idx < num) {
            this.activePage = idx;
            this.wizPanel.layout.setActiveItem(idx);
            this.updateButtons();
        }
    },

    updateProgressBar: function() {
        // update the bottom steps
        var infos = [];
        var idx = 0;
        this.wizPanel.items.each(function(){
           infos.push({ title: this.title, idx: idx++ });
        });
        this.progressStore = infos;
    },

    processPanels: function(data) {
        if (data && data.items) {
            if (data.items instanceof Array) {
                for (var i = 0; i < data.items.length; i++) {
                    this.processExternalItem(data.items[i]);
                }
            } else {
                this.processExternalItem(data.items);
            }
        }
    },

    processExternalItem: function(tab) {
        if (tab["xtype"] == "tabpanel") {
            this.processPanels(tab);
        } else {
            if (tab instanceof Array) {
                for (var i=0; i<tab.length; i++) {
                    this.processExternalItem(tab[i]);
                }
            } else {
                this.addPanel(CQ.Util.applyDefaults(tab, this.configDefaults["panel"]));
            }
        }
    },

    addPanel: function(panel) {
        var title = panel.title;
        if (!title) {
            title = "untitled";
        }
        panel.header = false;
        panel = this.wizPanel.add(panel);
        var dlg = this;
        var needsValidation = [];
        var registerHandler = function (item) {
            item.html = CQ.I18n.getVarMessage(item.html);
            if (item.isValid && !item.isValid()) {
                needsValidation.push(item);
                item.on("valid", function(item) {
                    needsValidation.remove(item);
                    dlg.validationHandler();
                });
                item.on("invalid", function(item) {
                    if (needsValidation.indexOf(item)<0) {
                        needsValidation.push(item);
                    }
                    dlg.validationHandler();
                });
            }
            if (item.items && item.items.each) {
                item.items.each(registerHandler);
            }
        };
        panel.items.each(registerHandler);

        var nextHandler = dlg.nextHandler;
        if (panel.nextHandler) {
            nextHandler = function() {
                dlg.nextButton.setDisabled(true);
                panel.nextHandler.call(dlg, dlg);
                dlg.nextButton.setDisabled(false);
            }
        } else if (panel.formUrl) {
            var url = panel.formUrl;
            nextHandler = function() {
                dlg.nextButton.setDisabled(true);
                var box = CQ.Ext.Msg.wait(CQ.I18n.getMessage("Action in progress"));
                var act = new CQ.Ext.form.Action.Submit(dlg.form, {
                    "url":url,
                    "method":"POST",
                    "success":function() {
                        act.hide();
                        nextHandler.call(dlg)},
                    "failure": function(form, action) {
                        var res = action.result;
                        if(res) {
                            CQ.Ext.Msg.show({
                                title: res.status + "",
                                msg: res.statusText,
                                buttons: CQ.Ext.Msg.OK,
                                icon: CQ.Ext.Msg.ERROR});
                        }
                        dlg.nextButton.setDisabled(true);
                }});
                dlg.form.doAction(act);
            }
        }
        var info = {
            "title":title,
            "idx":this.wizPanel.items.getCount()-1,
            "needsValidation":needsValidation,
            "nextHandler": nextHandler,
            "previousHandler": function() {dlg.navWizard(true);},
            "isValid": function()  {
                return this.needsValidation.length<1;
            }

        };
        this.progressStore.push(info);
    },

    updateButtons: function() {
        var num = this.wizPanel.items.getCount();
        var info = this.getActiveInfo();
        if (this.activePage < num) {
            this.nextButton.setDisabled(!info.isValid());
            if (this.activePage == num-1) {
                this.nextButton.setText(CQ.I18n.getMessage("Send"));
            } else {
                this.nextButton.setText(CQ.I18n.getMessage("Next"));
            }
            this.nextButton.setHandler(info.nextHandler, this);
        } else {
            this.nextButton.disable();
            this.nextButton.setText(CQ.I18n.getMessage("Next"));
        }
        if (this.activePage > 0) {
            this.prevButton.enable();
            this.prevButton.setHandler(info.previousHandler, this);
        } else {
            this.prevButton.disable();
        }
        // update toolbar buttons
        this.progressTemplate.overwrite(this.progressPanel.body, this.progressStore);
    },

    validationHandler: function(item, valid) {
        var info = this.getActiveInfo();
        if (info) {
            this.nextButton.setDisabled(!info.isValid());
        }
    },

    nextHandler: function() {
        var num = this.wizPanel.items.getCount();
        if(this.activePage==num-1)  {
            this.ok();
        } else {
            this.navWizard();
        }
    },

    navWizard:function(back) {
        var cnt=1;
        if(back){
            cnt=-1;
        }
        var target = this.activePage + cnt;
        if (target< this.wizPanel.items.getCount() && target>=0) {
            this.wizPanel.layout.setActiveItem(target);
            this.activePage = target;
            this.progressTemplate.overwrite(this.progressPanel.body, this.progressStore);
            this.updateButtons()
        }
    },

    getActivePanel: function() {
        if (this.activePage) {
            return this.wizPanel.items.getAt(this.activePage);
        }
    },

    getActiveInfo: function() {
        if (this.progressStore.length>this.activePage) {
            return this.progressStore[this.activePage];
        }
    },
    setRecipientsCnt: function(cnt) {
        if(cnt) this.recipientsCnt = cnt;
    },
    
    selectSyncMode: function(dialog) {
        var field;
        if (dialog) {
            field = dialog.getField(CQ.mcm.SendNewsletterWizard.PARAM_SLING_BG);
            if (field && field[0]) {
                field = field[0];
            }
        }
        var bg = this.recipientsCnt >this.bgThreshold;
        if (field) {
            field.setValue(bg);
        } else {
            dialog.addHidden({'name':CQ.mcm.SendNewsletterWizard.PARAM_SLING_BG,
                'value':bg});
        }
    }


});
CQ.mcm.SendNewsletterWizard.DEFAULT_BG_THRESHOlD = 10;

CQ.mcm.SendNewsletterWizard.PARAM_SLING_BG = "sling:bg";


CQ.Ext.reg("sendnewsletterwizard", CQ.mcm.SendNewsletterWizard);

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/

/**
 * Extends the AuthorizableSelection to be able to do more filtering.
 *
 * @constructor
 * @param {Object} config The configuration object
 *
 * @cfg {String} authorizableCategory if set, filter by this authorizableCategory
 */
CQ.mcm.FilteredAuthorizableSelection = CQ.Ext.extend(CQ.security.AuthorizableSelection, {

    authorizableCategory: null,
    
    constructor:function(config) {
        var that = this;

        CQ.Util.applyDefaults(config,{
            "authorizableCategory": null,
            // the load listener implements the additional filtering:
            storeConfig: {
                listeners: {
                    load: function(theStore, records, loadOptions) {
                        if (config.authorizableCategory != null) {
                            that.authorizableCategory = config.authorizableCategory;
                            var toRemove = [];
                            for (var i=0; i<records.length; i++) {
                                if (that.authorizableCategory != records[i].get("cq:authorizableCategory")) {
                                    toRemove.push(records[i]);
                                }
                            }
                            theStore.remove(toRemove);
                        }
                    }
                }
            }
        });
        CQ.mcm.FilteredAuthorizableSelection.superclass.constructor.call(this, config);
        
    },

    /**
     * @method initComponent
     */
    initComponent: function() {
        CQ.mcm.FilteredAuthorizableSelection.superclass.initComponent.call(this);
        
    }

});
CQ.Ext.reg("filteredauthselection", CQ.mcm.FilteredAuthorizableSelection);
// was unable to reference class from CQ.mcm.FilteredAutho... so set up this variable:

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/

CQ.mcm.CampaignComboBox = CQ.Ext.extend(CQ.Ext.form.ComboBox,  {

    storeUrl: "/bin/mcm/campaigns.json",

    storeLimit: 25,

    filter: null,
    
    constructor: function(config) {
        var that = this;
        
        CQ.Util.applyDefaults(config,{
            "stateful":false,
            "selectOnFocus": true,
            "minChars":0,
            "minListWidth":40,
            "displayField": "longTitle",
            "valueField": "path",
            // "queryParam":"filter",
            "storeConfig":{
                "autoLoad":false,
                "proxy": new CQ.Ext.data.HttpProxy({
                    "url":this.storeUrl,
                    "method":"GET"
                }),
                "baseParams": {
                    "limit":this.storeLimit,
                    "_charset_":"utf-8"
                },
                "reader": new CQ.Ext.data.JsonReader({
                        idProperty: "path",
                        root: "campaigns",
                        totalProperty: "results",
                        fields: [
                            "longTitle",
                            "path",
                            "title",
                            "description",
                            "brandname",
                            "parentResType"
                        ]
                })
            }
        });
        this.campaignStore = new CQ.Ext.data.Store(config.storeConfig);
        config.store = this.campaignStore;
        
        CQ.mcm.CampaignComboBox.superclass.constructor.call(this, config);
        
    }

});

CQ.Ext.reg('mcm-campaigncombobox', CQ.mcm.CampaignComboBox);

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/

/**
 * @class CQ.mcm.CampaignTreeNodeUI
 * @extends CQ.Ext.tree.TreeNodeUI
 * A special UI to render the count of experiences correctly
 * @constructor
 * Should not be called - see the TreeNodeUI doc.
 * @param {Object} config The config object
 * @since 5.5
 */
CQ.mcm.CampaignTreeNodeUI = CQ.Ext.extend(CQ.Ext.tree.TreeNodeUI, {
    constructor: function() {
       CQ.mcm.CampaignTreeNodeUI.superclass.constructor.apply(this, arguments);
    },
    renderElements: function(n, a, targetNode, bulkRender) {
        this.indentMarkup = n.parentNode ? n.parentNode.ui.getChildIndent() : '';

        var href = a.href ? a.href : CQ.Ext.isGecko ? "" : "#";
        var buf = ['<li class="x-tree-node"><div ext:tree-node-id="',            
            n.id,'" class="x-tree-node-el x-tree-node-leaf x-unselectable ', a.cls,'" unselectable="on">',
            '<span class="x-tree-node-indent">',this.indentMarkup,"</span>",
            '<img src="', this.emptyIcon, '" class="x-tree-ec-icon x-tree-elbow" />',
            '<img src="', a.icon || this.emptyIcon, '" class="x-tree-node-icon',
            (a.icon ? " x-tree-node-inline-icon" : ""),(a.iconCls ? " "+a.iconCls : ""),'" unselectable="on" />',
            '<a hidefocus="on" class="x-tree-node-anchor" href="',href,'" tabIndex="1" ', 
            a.hrefTarget ? ' target="'+a.hrefTarget+'"' : "", '>',
            '<span unselectable="on">',n.text,'</span><div class="experiences-count">' + a.experiences + '</div><span></span></a></div>',
            '<ul class="x-tree-node-ct" style="display:none;"></ul>',
            "</li>"].join('');

        var nel;
        if(bulkRender !== true && n.nextSibling && (nel = n.nextSibling.ui.getEl())){
            this.wrap = CQ.Ext.DomHelper.insertHtml("beforeBegin", nel, buf);
        } else {
            this.wrap = CQ.Ext.DomHelper.insertHtml("beforeEnd", targetNode, buf);
        }

        this.elNode = this.wrap.childNodes[0];
        this.ctNode = this.wrap.childNodes[1];
        var cs = this.elNode.childNodes;
        this.indentNode = cs[0];
        this.ecNode = cs[1];
        this.iconNode = cs[2];
        var index = 3;
        this.anchor = cs[index];
        this.textNode = cs[index].firstChild;
    }
});

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/

CQ.mcm.ListView = CQ.Ext.extend(CQ.Ext.grid.GridPanel, {

    baseId: "mcm-list-view",

    // switch Filter panel on in CampaignPlanner
    usesAdvancedFilter: true,

    constructor: function(config) {

        this.pagingToolbar = new CQ.Ext.PagingToolbar({
            pageSize: config.planner.pageSize,
            store: config.store,
            displayInfo: true,
            displayMsg: CQ.I18n.getMessage('Displaying experiences {0} - {1} of {2}'),
            emptyMsg: CQ.I18n.getMessage("No experiences to display")
        });

        var that = this;

        this.contextMenu = new CQ.Ext.menu.Menu({
            items: [{
            text: CQ.I18n.getMessage('Edit'),
            iconCls: 'edit',
            handler: function() { that.handleEditOf(that.contextMenuItem); },
            scope: that
            },{
            text: CQ.I18n.getMessage('Properties') + '&hellip;',
            iconCls: 'edit',
            handler: function() { that.handleProperties(that.contextMenuItem); },
            scope: that
            }]
        });

        CQ.Util.applyDefaults(config,  {
            enableColumnHide: false,
            stripeRows: true,
            viewConfig: {
                forceFit:true
            },
            selModel: new CQ.Ext.grid.RowSelectionModel({
                listeners: {
                    selectionchange: function(selModel) {
                        if(!selModel.hasSelection()) { // no selection
                            selModel.grid.topToolbar.items.each(function(item, index, length) {
                                item.setDisabled(item.noSelect === false);
                            });
                        } else if(selModel.getSelections().length > 1) { // multi selection
                            selModel.grid.topToolbar.items.each(function(item, index, length) {
                                if (false !== item.multiSelect) {
                                    that.checkSelectionEvent(item, selModel.getSelections());
                                } else {
                                    item.setDisabled(true);
                                }
                            });
                        } else { // single selection
                            selModel.grid.topToolbar.items.each(function(item, index, length) {
                                if (false !== item.singleSelect) {
                                    that.checkSelectionEvent(item, selModel.getSelections());
                                } else {
                                    item.setDisabled(true);
                                }
                            });
                        }
                    }
                }
            }),
            listeners: {
                rowdblclick: function(grid, rowIndex, evt) {
                    that.handleEditOf(grid.store.getAt(rowIndex));
                },
                rowcontextmenu: function(grid, rowIndex, event) {
                    if(event.altKey)
                        return;
                    event.stopEvent();
                    that.contextMenuItem = grid.store.getAt(rowIndex);
                    that.contextMenu.showAt(event.xy);
                }
            },
            columns: [
                {
                    header: CQ.I18n.getMessage("Image"),
                    dataIndex: 'image',
                    css: 'height:65px;',
                    width: 120,
                    fixed: true,
                    menuDisabled: true,
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        return "<img src='" + CQ.HTTP.externalize(CQ.shared.XSS.getXSSValue(record.data.image)) + "' style='max-width:110px; max-height:55px;'/>";
                    }
                },{
                    header: CQ.I18n.getMessage("Experience"),
                    dataIndex: 'experienceTitle',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        var html = "<p class='title'>" + CQ.shared.XSS.getXSSValue(record.data.experienceTitle) + "</p>";

                        if(record.data.segments && record.data.segments.length > 0) {
                            html += "<p class='textline'>Segments: ";
                            for(var i=0; i < record.data.segments.length; i++) {
                                html += (i > 0? ", ": "") + "<a target='_blank' href='" + CQ.HTTP.externalize(CQ.shared.XSS.getXSSValue(record.data.segments[i].path)) + ".html'>" + record.data.segments[i].title + "</a>";
                            }
                            html += "</p>";
                        }

                        if(record.data.tags && record.data.tags.length > 0) {
                            html += "<p class='textline'>";
                            for(var i=0; i < record.data.tags.length; i++) {
                                html += "<span class='tag'>" + CQ.shared.XSS.getXSSValue(record.data.tags[i].title) + "</span>";
                            }
                            html += "</p>";
                        }
                        return html;
                    },
                    sortable: true
                },{
                    id: 'last',
                    header: CQ.I18n.getMessage("Touchpoint"),
                    dataIndex: 'touchpointTitle',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        var html = "<p class='title'>"
                            + (record.data.touchpointTitle ? CQ.shared.XSS.getXSSValue(record.data.touchpointTitle)
                                : CQ.I18n.getMessage("No Touchpoints selected yet"))
                            + "</p>";
                        if(record.data.touchpointPage && record.data.touchpointPage != '')
                            html += "<p class='textline'>Page: <a href=''>" + CQ.shared.XSS.getXSSValue(record.data.touchpointPage) + "</a></p>";
                        if(record.data.touchpointChannel && record.data.touchpointChannel != '')
                            html += "<p class='channel textline'>Channel: " + CQ.shared.XSS.getXSSValue(record.data.touchpointChannel) + "</p>";
                        return html;
                    },
                    sortable: true
                },{
                    header: CQ.I18n.getMessage("On Time"),
                    dataIndex: 'onTime',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        if (record.data.onTime) {
                            var formatter = new CQ.mcm.utils.RelativeDateFormatter();
                            var d = Date.parseDate(record.data.onTime, "Y-m-d\\TH:i:s.uP");
                            var tooltip = d.format("Y-m-d G:i");
                            return "<div title='" + tooltip + "'>" + formatter.format(d) + "</div>";
                        }
                        return "";
                    },
                    width: 100,
                    fixed: true,
                    sortable: true
                },{
                    header: CQ.I18n.getMessage("Off Time"),
                    dataIndex: 'offTime',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        if (record.data.offTime) {
                            var formatter = new CQ.mcm.utils.RelativeDateFormatter();
                            var d = Date.parseDate(record.data.offTime, "Y-m-d\\TH:i:s.uP");
                            var tooltip = d.format("Y-m-d G:i");
                            return "<div title='" + tooltip + "'>" + formatter.format(d) + "</div>";
                        }
                        return "";
                    },
                    width: 100,
                    fixed: true,
                    sortable: true
                }
            ],
            tbar: [
                {
                    iconCls: 'cq-siteadmin-refresh',
                    handler: function() {this.handleRefresh();},
                    scope: this
                },
                "-",
                { // be aware that these buttons have to be the same in all views!
                    id: that.baseId + "-viewbutton-0",
                    enableToggle: true,
                    pressed: true,
                    allowDepress: false,
                    iconCls: "cq-cft-dataview-mosaic",
                    toggleGroup: "campaignview-calendar",
                    toggleHandler: that.switchCampaignView,
                    scope: that
                },{
                    id: that.baseId + "-viewbutton-1",
                    enableToggle: true,
                    allowDepress: false,
                    iconCls: "cq-cft-dataview-list",
                    toggleGroup: "campaignview-calendar",
                    toggleHandler: that.switchCampaignView,
                    scope: that
                },
                "-",
                {
                    text: CQ.I18n.getMessage("New..."),
                    handler: function() {this.handleNew();},
                    scope: this
                },
                {
                    text: CQ.I18n.getMessage("Edit"),
                    handler: function() {this.handleEdit();},
                    scope: this,
                    disabled: true,
                    multiSelect: false,
                    singleSelect: true,
                    noSelect: false
                },
                {
                    text: CQ.I18n.getMessage("Properties") +"&hellip;",
                    handler: function() {this.handleProperties();},
                    scope: this,
                    disabled: true,
                    multiSelect: false,
                    singleSelect: true,
                    noSelect: false
                },
                "-",
                {
                    text: CQ.I18n.getMessage("Simulate"),
                    handler: function() {this.handleSimulate();},
                    scope: this,
                    disabled: true,
                    multiSelect: false,
                    singleSelect: true,
                    noSelect: false,
                    enabledSelTypes: {"twitter": true, "tweet": true,
                                        "teaser": true, "newsletter":true}

                },
                {
                    text: CQ.I18n.getMessage("Analyze") + "&hellip;",
                    handler: function() {this.handleAnalyze();},
                    scope: this,
                    disabled: true,
                    multiSelect: false,
                    singleSelect: true,
                    noSelect: false,
                    disabledSelTypes: {"twitter": true, "tweet": true}
                },
                "-",
                {
                    text: CQ.I18n.getMessage("Delete"),
                    handler: function() {this.handleDelete();},
                    scope: this,
                    disabled: true,
                    multiSelect: true,
                    singleSelect: true,
                    noSelect: false
                },
                '->', // the right part of the toolbar should be the same for all views!!
                {
                    xtype: "textfield",
                    disabled: true,
                    emptyText: CQ.I18n.getMessage("Enter search term"),
                    id: this.baseId + "-searchfield",
                    listeners: {
                        specialkey: function(theField, e) {
                            if (e.getKey() == e.ENTER) {
                                config.planner.doSearch();
                            }
                        }
                    }
                }, {
                    text: CQ.I18n.getMessage("Search"),
                    disabled: true,
                    id: this.baseId + "-searchbutton",
                    handler: config.planner.doSearch,
                    scope: config.planner
                }, {
                    text: CQ.I18n.getMessage("Clear"),
                    disabled: true,
                    id: this.baseId + "-clearsearchbutton",
                    handler: config.planner.clearSearch,
                    scope: config.planner
                }, {
                    enableToggle: true,
                    disabled: true,
                    id: this.baseId + "-advancedtogglebutton",
                    text: CQ.I18n.getMessage("Advanced"),
                    toggleHandler: config.planner.switchAdvancedOptions,
                    scope: config.planner
                }
            ],
            bbar: that.pagingToolbar
        });

        CQ.mcm.ListView.superclass.constructor.call(this, config);
    },
    
    checkSelectionEvent: function(toolBarItem, items) {
        if (items && toolBarItem) {
            if (toolBarItem.enabledSelTypes) {
                var disabled = false;
                for (var i=0; i<items.length; i++) {
                    if (true !== toolBarItem.enabledSelTypes[items[i].data.type]) {
                        disabled = true;
                        break;
                    }
                }
                toolBarItem.setDisabled(disabled);
            } else if (toolBarItem.disabledSelTypes) {
                var disabled = false;
                for (var i=0; i<items.length; i++) {
                    if (true === toolBarItem.disabledSelTypes[items[i].data.type]) {
                        disabled = true;
                        break;
                    }
                }
                toolBarItem.setDisabled(disabled);
            } else {
                toolBarItem.setDisabled(false);
            }
        } else {
            toolBarItem.setDisabled(true);
        }
    },
    
    handleRefresh: function() {
        this.planner.refreshData(this.pagingToolbar.cursor);
    },
    
    switchCampaignView: function(button, state) {
        if(state == true) {
            var itemId = button.id.replace(this.baseId + "-viewbutton-", "");
            this.planner.switchCampaignView(itemId);
        }
    },
    
    handleNew: function() {
        CQ.mcm.Util.createPageAndOpenPropsDialog(CQ.I18n.getMessage("Create Experience"), this.planner.currentRootPath,
            function(propsDialog) {
                var titleField = propsDialog.getField("./jcr:title");
                //this.planner.setSearch(titleField.getValue()); // populates the search tab and shows only created expereince, does not look intutive.
            },
            function() {
                CQ.Ext.Msg.alert(
                    CQ.I18n.getMessage("Error"),
                    CQ.I18n.getMessage("Could not create experience.")
                );
            },
            this)
    },
    
    handleEdit: function() {
        var selection = this.selModel.getSelections();
        if(selection.length > 0) {
            this.handleEditOf(selection[0]);
        }
    },
    
    handleEditOf: function(item) {
        if(item) {
            var pagePath = "/bin/wcmcommand?cmd=open&path=" + item.id ;
        	if (item.data.type == "newsletter") {
                // ATTENTION: Hacking here. The parent separation is available in the EmulatorManager.
                // But because I cannot access the emulator manager of the new window, I cannot
                // read it's config. So hardcoding it here to 3.
                var cookiePath = CQ.Util.getAbsoluteParent(pagePath, 3);
                CQ.HTTP.setCookie("cq-emulator", "none", CQ.HTTP.externalize(cookiePath));
                CQ.shared.Util.open(CQ.HTTP.externalize(pagePath));
            } else {
            	CQ.shared.Util.open(CQ.HTTP.externalize(pagePath));
            }
        }
    },
    
    handleProperties: function(itemParam) {
        var item = null;
        if (itemParam) {
            item = itemParam;
        } else {
            var selection = this.selModel.getSelections();
            if(selection.length > 0) {
                item = selection[0];
            }
        }
        if (item != null) {
            var that = this;
            var refresher = function() {that.handleRefresh();};
            var contentPath = item.id + "/jcr:content";

            var dialogPath = CQ.mcm.PluginHook.getPlugin(item.data.pluginId).getExperiencePropertiesDialogPath(item);
            CQ.mcm.Util.openDialog(contentPath, dialogPath, false, refresher);
        }
    },
    
    handleAnalyze: function() {
        var selection = this.selModel.getSelections();
        if(selection.length > 0) {
            if(selection[0].data.analyzeUrl != "") {
                var dlg = CQ.WCM.getDialog(
                    {
                        "jcr:primaryType": "cq:Panel",
                        "xtype": "statistics",
                        "cls": "cq-propsdialog-impressions",
                        "header": false,
                        "bodyStyle": {padding:"15px 15px"},
                        "width":350,
                        "height":300,
                        "screen": {
                            "autoEl": {
                                "src": CQ.HTTP.getContextPath() + "/libs/cq/ui/resources/0.gif"
                            }
                        }
                    },
                    'impressions'
                );
                dlg.loadContent(selection[0].data.analyzeUrl + "/jcr:content");
                dlg.setTitle(CQ.I18n.getMessage("Page impressions of ") + selection[0].data.analyzeUrl);
                dlg.show();
            }
        }
    },
    
    handleSimulate: function() {
        var selection = this.selModel.getSelections();
        if(selection.length > 0) {

            if (selection[0].data.type == "newsletter") {
                // ATTENTION: Hacking here. The parent separation is available in the EmulatorManager.
                // But because I cannot access the emulator manager of the new window, I cannot
                // read it's config. So hardcoding it here to 3.
                var pagePath = selection[0].id + ".html";
                var cookiePath = CQ.Util.getAbsoluteParent(pagePath, 3);
                CQ.HTTP.setCookie("cq-emulator", "Gmail", CQ.HTTP.externalize(cookiePath));
                CQ.shared.Util.open(CQ.HTTP.externalize(pagePath));
                
            } else if (selection[0].data.type == "teaser") {
                if(selection[0].data.simulateUrl != "") {
                    var path = selection[0].id;
                    CQ_Analytics.PageDataMgr.setExperience(path);
                    CQ.WCM.setMode(CQ.WCM.MODE_PREVIEW);
                    CQ.HTTP.setCookie("show-clickstreamcloud", "true", "/");
                    CQ.shared.Util.open(CQ.HTTP.externalize(selection[0].data.simulateUrl));
                } else {
                    CQ.Ext.Msg.alert(
                        CQ.I18n.getMessage("Warning"),
                        CQ.I18n.getMessage("Cannot simulate teaser if no touchpoint is assigned.")
                    );
                }
            } else {
                var standardSimTypes = ["twitter", "tweet"];
                // just open standardSimTypes, nothing for the rest
                if (standardSimTypes.indexOf(selection[0].data.type) > -1) {
                    var path = CQ.HTTP.externalize(selection[0].id + ".html");
                    CQ.shared.Util.open(path);
                }
            }
        }
    },
    
     handleDelete: function() {
        var selection = this.selModel.getSelections();
        if(selection.length > 0) {
            CQ.Ext.Msg.confirm(
                CQ.I18n.getMessage("Delete offer"),
                        CQ.I18n.getMessage("Are you sure you want to delete this offer?"),
                        function (button) {
                            if (button == "yes") {
                               var data = {
               					 	":operation": "delete",
                					":applyTo": []
            						};
            				for(var i=0; i < selection.length; i++) {
            				    var name = selection[i].id.replace(/.*\/(.*)/, "$1");
            					data[":applyTo"].push(name);
           					 }
           				 CQ.HTTP.post(this.planner.currentRootPath, function() {
            				    this.handleRefresh();
            					}, data, this);
                            }
                        },
                this
                );

        }
    },

    
    
    openIframeFor: function(urlParam, titleParam) {
        var iframeDialog = null;
        var dlgConfig = {
            title: titleParam,
            width: 800,
            height: 500,
            cancelText: CQ.I18n.getMessage("Close"),
            buttons: [
                CQ.Dialog.CANCEL,
            ],
            success: function() {
                // run after successful ok() handler
            },
            listeners: {
                loadContent: function(dialog) {
                }
            }
        };

        iframeDialog = new CQ.IframeDialog(dlgConfig);

        iframeDialog.show();
        iframeDialog.loadContent(urlParam);

    }
    
});

CQ.Ext.reg("mcmlistview", CQ.mcm.ListView);

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/


CQ.mcm.CalendarView = CQ.Ext.extend(CQ.Ext.Panel, {
    baseId: "mcm-calendar-view",
    constructor: function(config) {
        var that = this;
        CQ.Util.applyDefaults(config,  {
            id: 'some_id',
            bodyCssClass: 'cq-calendar',
            layout: "border",
            tbar: [
                {
                    iconCls: 'cq-siteadmin-refresh',
                    handler: function() {this.handleRefresh();},
                    scope: this
                },
                "-",
                { // be aware that these buttons have to be the same in all views!
                    id: that.baseId + "-viewbutton-0",
                    enableToggle: true,
                    pressed: true,
                    allowDepress: false,
                    iconCls: "cq-cft-dataview-mosaic",
                    toggleGroup: "campaignview-calendar",
                    toggleHandler: that.switchCampaignView,
                    scope: that
                },{
                    id: that.baseId + "-viewbutton-1",
                    enableToggle: true,
                    allowDepress: false,
                    iconCls: "cq-cft-dataview-list",
                    toggleGroup: "campaignview-calendar",
                    toggleHandler: that.switchCampaignView,
                    scope: that
                },
                "-",
                {
                    text: CQ.I18n.getMessage("Add Touchpoint&hellip;"),
                    handler: function() { this.handleAddTouchpoint(); },
                    scope: this
                },
                "-",
                {
                    text: "&#x25C0;",
                    handler: function() { this.handleMoveDateBackward(); },
                    tooltip: CQ.I18n.getMessage("Go backwards"),
                    scope: this
                },
                {
                    xtype: "tbtext",
                    id: "toolbarcurrenttimespanlabel",
                    text: "<b>Month</b>",
                    scope: this,
                    width: 90,
                    autoWidth: false,
                    style: {
                        "text-align": "center"
                    }
                },
                {
                    text: "&#x25B6;",
                    handler: function() { this.handleMoveDateForward(); },
                    tooltip: CQ.I18n.getMessage("Go forward"),
                    scope: this
                },
                "-",
                {
                    text: CQ.I18n.getMessage("Today"),
                    handler: function() { this.handleShowToday(); },
                    scope: this
                },
                {
                    tag: "div",
                    id: "cq-calendar-lensdeck-buttons",
                    style: {
                        "display": "none"
                    },
                    flex: 0
                },
                '->', // the right part of the toolbar should be the same for all views!!
                {
                    xtype: "textfield",
                    disabled: true,
                    emptyText: CQ.I18n.getMessage("Enter search term"),
                    id: this.baseId + "-searchfield",
                    listeners: {
                        specialkey: function(theField, e) {
                            if (e.getKey() == e.ENTER) {
                                config.planner.doSearch();
                            }
                        }
                    }
                }, {
                    text: CQ.I18n.getMessage("Search"),
                    disabled: true,
                    id: this.baseId + "-searchbutton",
                    handler: config.planner.doSearch,
                    scope: config.planner
                }, {
                    text: CQ.I18n.getMessage("Clear"),
                    disabled: true,
                    id: this.baseId + "-clearsearchbutton",
                    handler: config.planner.clearSearch,
                    scope: config.planner
                }, {
                    enableToggle: true,
                    disabled: true,
                    id: this.baseId + "-advancedtogglebutton",
                    text: CQ.I18n.getMessage("Advanced"),
                    toggleHandler: config.planner.switchAdvancedOptions,
                    scope: config.planner
                }
            ],
            items: [
                {
                    xtype: 'form',
                    method: 'GET',
                    border: false,
                    id: 'querybuilder-form',
                    url: '/bin/querybuilder.json',
                    height: 0,
                    width: "100%",
                    flex: 0,
                    region: "north" // should be ignored
                },
                {
                    xtype: 'lensdeck',
                    "renderButtonsTo": "cq-calendar-lensdeck-buttons",
                    "activateFirstLens": false,
                    region: "center",
                    autoScroll: true,
                    flex: 1
                }
            ],
            listeners: {
                activate: function(panel) {
                    if(panel.calendarRendered) {
                        CQ.mcm.cal.Calendar.update();
                        return;
                    }
                    try{
                        var qb = new CQ.search.QueryBuilder({
                            "form": panel.form.getForm(),
                            "renderFieldsTo": "querybuilder-form"
                        });

                        CQ.search.Util.setQueryBuilder(qb);

                        CQ.search.Util.setLensContainer(panel.lensdeck);

                        CQ.mcm.cal.Calendar.init({
                            element: "mcm-campaign-planner-viewcontainer-1",
                            queryBuilder: qb,
                            setDateDisplay: function(html) { panel.updateDateDisplay(html); }
                        });

                        var config = {
                            "xtype": "campaignlens",
                            "id": "some_lens_id",
                            buttonText: "Month",
                            touchpointStore: panel.touchpointStore,
                            planner: panel.planner,
                            "text": "Campaigns"
                        };

                        var buttonConfig = {
                            tooltip: "Month View",
                            tooltipType: "title"
                        };
                        CQ.search.Util.addLens(CQ.Util.build(config), "campaigns", buttonConfig);

                        CQ.search.Util.getLensContainer().setActiveLens("campaigns");
                        panel.calendarRendered = true;
                    }catch(e) {
                        console.error("", e);
                    }

                }
            }
        });

        CQ.mcm.CalendarView.superclass.constructor.call(this, config);

        this.calendarRendered = false;
        this.lensdeck = this.get(1);
        this.form = this.get(0);
        this.dateDisplayWidget = this.getTopToolbar().findById("toolbarcurrenttimespanlabel");
    },
    handleRefresh: function() {
        this.planner.refreshData();
        CQ.mcm.cal.Calendar.update();
    },
    switchCampaignView: function(button, state) {
        if(state == true) {
            var itemId = button.id.replace(this.baseId + "-viewbutton-", "");
            this.planner.switchCampaignView(itemId);
        }
    },
    handleAddTouchpoint: function() {
        var that = this;
        var currentTouchpoints = [];
        CQ.HTTP.get(
            that.planner.currentRootPath + "/" + "jcr:content/touchpoints" + CQ.HTTP.EXTENSION_JSON,
            function (options, success, response) {
                if (success) {
                    var data = CQ.HTTP.eval(response);
                    if (data["touchpoints"]) {
                        currentTouchpoints = data["touchpoints"];
                    }
                } else if (response.status == "404") {
                    // console.log("touchpoints prop not found - ok, creating on ok");
                } else {
                    // console.log("problem!");
                }

                var browseDialog = null;
                browseDialog = new CQ.mcm.TeaserBrowseDialog({
                    ok: function() {
                        var path = browseDialog.getSelectedPath();
                        if (path) {
                            if (currentTouchpoints.indexOf(path) == -1) {
                                currentTouchpoints.push(path);
                                var params = {
                                    "touchpoints": currentTouchpoints,
                                    "touchpoints@TypeHint": "String[]"
                                };

                                var serverResponse = CQ.utils.HTTP.post(that.planner.currentRootPath + "/jcr:content", null, params, this);
                                if (CQ.utils.HTTP.isOk(serverResponse)) {
                                    // console.log("ok");
                                    that.handleRefresh();
                                } else {
                                    // console.log("not ok: " + serverResponse);
                                }
                            } else {
                                // console.log("already contained");
                            }
                        } else {
                            // console.log("no path sele");
                        }
                        browseDialog.hide();
                    }
                });

                browseDialog.show();
            }
        );

    },
    handleMoveDateBackward: function() {
        CQ.mcm.cal.Calendar.prev();
    },
    handleMoveDateForward: function() {
        CQ.mcm.cal.Calendar.next();
    },
    handleShowToday: function() {
        CQ.mcm.cal.Calendar.today();
    },
    updateDateDisplay: function(htmlContent) {
        this.dateDisplayWidget.setText(htmlContent);
    }
});

CQ.Ext.reg("mcmcalendarview", CQ.mcm.CalendarView);

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/

/**
 * @class CQ.mcm.CampaignPlanner
 * @extends CQ.Ext.Panel
 * The campaigns overview panel of the Marketing Campaigns Managment console. 
 * It contains the list and calendar views of a campaign. 
 * @constructor
 * Creates a new Campaigns Overview.
 * @param {Object} config The config object
 * @since 5.5
 */
CQ.mcm.CampaignPlanner = CQ.Ext.extend(CQ.Ext.Panel, {

    /**
     * @cfg {String} path
     * The root path of the campaigns (defaults to "
     */
    path: "/content/campaigns",
    
    baseId: "mcm-campaign-planner",
    
    /**
     * @cfg {Number} pageSize
     * Size of the pages for listview etc.
     */
    pageSize: 15,

    constructor: function(config) {
        var that = this;
        this.currentRootPath = "";
        try {
        this.store = new CQ.Ext.data.JsonStore({
            root: 'experiences',
            totalProperty: 'experiencesTotal',
            idProperty: 'id',
            remoteSort: true,
            sortInfo: { field: 'experienceTitle', direction: 'ASC' },
            proxy: new CQ.Ext.data.HttpProxy ({
                method: "GET",
                url: "/libs/mcm/experiences.json"
            }),
			"baseParams": {
                "_charset_":"utf-8"
            },
            listeners: {
                "beforeload": function(store, opts) {
                
                    /* if we get the resource-based resolution of the experiences servlet to work this should be used:
                     store.proxy.url = CQ.HTTP.externalize(that.currentRootPath + "/jcr:content.experiences.json");
                    store.proxy.conn.url = CQ.HTTP.externalize(that.currentRootPath + "/jcr:content.experiences.json");
                    console.log("Before load ", CQ.HTTP.externalize(that.currentRootPath + "/jcr:content.experiences.json"));
                    */
                    opts.params.path = that.currentRootPath;
                    if (opts.params.limit) {
                        // ok, paging params set
                    } else {
                        // need to set to first page
                        opts.params.start = 0;
                        opts.params.limit = that.pageSize;
                    }
                }
            },
    
            fields: [
                'id', 
                'type',
                'pluginId',
                'image', 
                'experienceTitle', 
                'segments', 
                'tags',
                'touchpointTitle',
                'touchpointPage',
                'touchpointChannel',
                'onTime',
                'offTime',
                'analyzeUrl',
                'simulateUrl'
            ]
        });


        this.touchpointStore = new CQ.Ext.data.JsonStore({
            root: 'touchpoints',
            idProperty: 'id',
            remoteSort: true,
    
            fields: [
                'id',
                'pluginId',
                'channel',
                'title',
                'color',
                'pagetitle',
                'pageuri'
            ]
        });

        this.path = config.path ? config.path : this.path;

        var filterComboDefaultListeners = {
            select: function(combo, record, index) {
                that.refreshData();
            },
            keyup: function(combo, evt) { 
                if (evt.keyCode == evt.RETURN || evt.keyCode == evt.ENTER) {
                    that.refreshData();
                } else {

                    // this event happens even for TAB key - so to hold unnecessary refreshing:
                    if (evt.keyCode != evt.TAB) {
                        that.filterDirty = true;
                    }
                }
            },
            beforequery: function(qe) {
                qe.combo.lastQuery = null;
            },
            blur: function(combo) {
                if (that.filterDirty) {
                    that.refreshData();
                }
            }
        };
        
        CQ.Util.applyDefaults(config,  {
            cls: "cq-mcm-planner",
            layout: "border",
            border: false,
            items: [
                that.optionsPanel = new CQ.Ext.Panel({
                    height: 27,
                    width: "100%",
                    region: "north",
                    border: false,
                    flex: 0,
                    layout: {
                        type: 'hbox',
                        padding: "3"
                    },
                    hidden: true,
                    defaults: {
                        margins: {
                            top: 0,
                            right: 2,
                            bottom: 0,
                            left: 2
                        }
                    },
                    items: [
                        {
                            xtype: "combo",
                            id: that.baseId + "-channelfiltercombo",
                            emptyText: CQ.I18n.getMessage("Filter by Channel"),
                            triggerAction: "all",
                            selectOnFocus: true,
                            autoSelect: false,
                            minChars: 0,
                            displayField: "channelname",
                            valueField: "channelname",
                            queryParam: "channelFilter",
                            flex: 2,
                            border: false,
                            style: {
                                "vertical-align": "baseline"
                            },
                            listeners: filterComboDefaultListeners,
                            store: new CQ.Ext.data.Store({
                                autoLoad: false,
                                proxy: new CQ.Ext.data.HttpProxy({
                                    url: "laterset",
                                    method: "GET"
                                }),
                                "baseParams": {
                                    "_charset_":"utf-8"
                                },
                                "reader": new CQ.Ext.data.JsonReader({
                                        idProperty: "channelname",
                                        root: "touchpoints",
                                        fields: [
                                            {name: "channelname", 
                                                convert: function(val, o, idx) {
                                                    if (o["channel"]) {
                                                        return o["channel"];
                                                    } else {
                                                        return "not set";
                                                    }
                                                }
                                            }
                                        ]
                                }),
                                listeners: {
                                    beforeload: function(store, opts) {
                                        store.proxy.url = CQ.HTTP.externalize(that.currentRootPath + "/jcr:content.touchpoints.json");
                                        store.proxy.conn.url = CQ.HTTP.externalize(that.currentRootPath + "/jcr:content.touchpoints.json");
                                    },
                                    load: function(store, records, opts) {
                                        var checkMap = {};
                                        if (records) {
                                            var i = records.length - 1;
                                            while (i>=0) {
                                                var channelname = records[i].data.channelname;
                                                if (checkMap[channelname]) {
                                                    // remove duplicates
                                                    store.removeAt(i);
                                                } else {
                                                    checkMap[channelname] = true;
                                                }
                                                i--;
                                            };
                                        }
                                    }
                                }
                            })
                        },
                        {
                            xtype: "combo",
                            id: that.baseId + "-touchpointfiltercombo",
                            "stateful":false,
                            emptyText: CQ.I18n.getMessage("Filter by Touchpoint"),
                            triggerAction: "all",
                            selectOnFocus: true,
                            autoSelect: false,
                            minChars: 0,
                            displayField: "touchpointName",
                            valueField: "touchpointName",
                            queryParam: "touchpointNameFilter",
                            flex: 2,
                            border: false,
                            style: {
                                "vertical-align": "baseline"
                            },
                            listeners: filterComboDefaultListeners,
                            store: new CQ.Ext.data.Store({
                                autoLoad: false,
                                proxy: new CQ.Ext.data.HttpProxy({
                                    url: "laterset",
                                    method: "GET"
                                }),
                                "baseParams": {
                                    "_charset_":"utf-8"
                                },
                                "reader": new CQ.Ext.data.JsonReader({
                                        idProperty: "title",
                                        root: "touchpoints",
                                        fields: [
                                            "touchpointName"
                                        ]
                                }),
                                listeners: {
                                    beforeload: function(store, opts) {
                                        store.proxy.url = CQ.HTTP.externalize(that.currentRootPath + "/jcr:content.touchpoints.json");
                                        store.proxy.conn.url = CQ.HTTP.externalize(that.currentRootPath + "/jcr:content.touchpoints.json");
                                        
                                        var channelFilter = that.optionsPanel.get(that.baseId + "-channelfiltercombo").getRawValue();
                                        store.baseParams["channelFilter"] = channelFilter;
                                    },
                                    load: function(store, records, opts) {
                                        var checkMap = {};
                                        if (records) {
                                            var i = records.length - 1;
                                            while (i>=0) {
                                                var tpname = records[i].data.touchpointName;
                                                if (checkMap[tpname]) {
                                                    // remove duplicates
                                                    store.removeAt(i);
                                                } else {
                                                    checkMap[tpname] = true;
                                                }
                                                i--;
                                            };
                                        }
                                    }
                                }
                            })
                        },
                        {
                            xtype: "pathfield",
                            emptyText: CQ.I18n.getMessage("Filter by Segment"),
                            id: that.baseId + "-segmentfiltercombo",
                            selectOnFocus: true,
                            autoSelect: false,
                            rootPath: "/etc/segmentation",
                            flex: 2,
                            border: false,
                            style: {
                                "vertical-align": "baseline"
                            },
                            listeners: CQ.Util.applyDefaults(filterComboDefaultListeners, {
                                dialogselect: function(combo, record, index) { that.refreshData(); }
                            })
                        },
                        {
                            xtype: "combo",
                            emptyText: CQ.I18n.getMessage("Filter by Author"),
                            id: that.baseId + "-authorfiltercombo",
                            triggerAction: "all",
                            selectOnFocus: true,
                            autoSelect: false,
                            minChars: 0,
                            displayField: "name",
                            valueField: "name",
                            queryParam: "filter",
                            flex: 2,
                            border: false,
                            style: {
                                "vertical-align": "baseline"
                            },
                            store: new CQ.Ext.data.Store(CQ.Util.applyDefaults(config.authorfiltercombo, {
                                "proxy": new CQ.Ext.data.HttpProxy({
                                    "url":"/bin/security/authorizables.json",
                                    "method":"GET",
                                    "_charset_":"utf-8"
                                }),
                                "baseParams": {
                                    "hideGroups":true,
                                    "hideUsers":false,
                                    "limit": 25
                                },
                                "reader": new CQ.Ext.data.JsonReader({
                                    idProperty: "id",
                                    root: "authorizables",
                                    fields: [
                                        "name"
                                    ]
                                })
                            })),
                            listeners: filterComboDefaultListeners
                        },
                        {
                            xtype: "button",
                            text: CQ.I18n.getMessage("Reset Filter"),
                            flex: 1,
                            height: 21,
                            border: false,
                            style: {
                                "vertical-align": "baseline"
                            },
                            handler: function() { that.clearFilters(); }
                        }
                    ]
                }),
                that.campaignViewPanel = new CQ.Ext.Panel({
                    border: false,
                    flex: 1,
                    region: "center",
                    layout: "card",
                    activeItem: 0,
                    "cls": "cq-mcm-campaigns",
                    "items": [{
                        id: that.baseId + "-viewcontainer-0",
                        xtype: "mcmcalendarview",
                        cls: "calendarview",
                        touchpointStore: that.touchpointStore,
                        planner: that,
                        border: false
                    }, {
                        id: that.baseId + "-viewcontainer-1",
                        xtype: "mcmlistview",
                        cls: "listview",
                        store: that.store,
                        planner: that,
                        border: false
                    }]
                })]
        });

        CQ.mcm.CampaignPlanner.superclass.constructor.call(this, config);

        CQ.event.EventAdmin.registerEventHandler("com/day/mcm/SELECTIONCHANGE", this.selectionChange, this);
        } catch (e) {
            console.log(e);
        }
    },
    selectionChange: function(event) {
        if (this.currentRootPath != event.properties.path) {
            if(event.properties.resourceType != "cq/personalization/components/campaignpage")
                return;
    
            this.currentRootPath = event.properties.path;
            this.currentSelection = event.properties;
    
            this.refreshData();

            CQ.mcm.cal.Calendar.setDate(new Date());
            CQ.mcm.cal.Calendar.update();
        }
    },
    refreshData: function(cursor, searchField) {
        if (cursor) {
            // ok, using given cursor
        } else {
            cursor = 0; // default to start
        }
    
        var paramsObject = {
            start: cursor,
            limit: this.pageSize
        };
        var filter = this.getFilter();
        if (filter) {
            paramsObject["filter"] = CQ.HTTP.externalize(CQ.Ext.util.JSON.encode(filter));
        }
        //before loading clear the store cache
	this.store.removeAll();
        this.store.load({
            params: paramsObject
        });  
        
        this.touchpointStore.loadData(CQ.HTTP.eval(this.currentRootPath + "/jcr:content.touchpoints.json"));
        
        this.filterDirty = false;
        
        var pathToRefresh = this.currentRootPath;
        CQ.event.EventAdmin.sendEvent( new CQ.event.Event( "com/day/mcm/REFRESH", {
            path: pathToRefresh
        }) );
    },
    getFilter: function() {
        var filter = {};
        var hasFilter = false;
        // need to get RAW value here to make use of ENTER work, which's event is received before 
        // getValue returns the updated value
        var channelFilter = this.optionsPanel.get(this.baseId + "-channelfiltercombo").getRawValue();
        if (channelFilter) {
            filter["touchpointChannel"] = channelFilter;
            hasFilter = true;
        }
        var touchpointFilter = this.optionsPanel.get(this.baseId + "-touchpointfiltercombo").getRawValue();
        if (touchpointFilter) {
            filter["touchpointTitle"] = touchpointFilter;
            hasFilter = true;
        }
        var authorFilter = this.optionsPanel.get(this.baseId + "-authorfiltercombo").getRawValue();
        if (authorFilter) {
            filter["lastModifiedByTitle"] = authorFilter;
            hasFilter = true;
        }

        var segmentFilterCombo = this.optionsPanel.get(this.baseId + "-segmentfiltercombo");
        var segmentFilterVal = segmentFilterCombo.getRawValue();
        if (segmentFilterVal) {
            filter["segments"] = {
                    type: "listmember",
                    key: "path",
                    value: segmentFilterVal
            };
            hasFilter = true;
        }
        

        var toolbar = this.campaignViewPanel.layout.activeItem.getTopToolbar();
        var itemBaseId = this.campaignViewPanel.layout.activeItem.baseId;
        var searchValue = toolbar.get(itemBaseId + "-searchfield").getValue();
        if (searchValue) {
            filter["experienceTitle"] = searchValue;
            hasFilter = true;
        }
        
        if (hasFilter) {
            return filter;
        }
        return null;
    },
    clearFilters: function() {
        var filterSubIds = ["-channelfiltercombo",
                            "-touchpointfiltercombo",
                            "-segmentfiltercombo",
                            "-authorfiltercombo",
                            "-languagefiltercombo"
                            ];
        
        for (var i=0; i<filterSubIds.length; i++) {
            var curr = filterSubIds[i];
            var combo = this.optionsPanel.get(this.baseId + curr);
            if (combo) {
                combo.setValue("");
            } else {
                // might not have been created yet
            }
        }
        
        this.refreshData();
    },
    switchCampaignView: function(itemNo) {
        var itemId = this.baseId + "-viewcontainer-" + itemNo;
        if(this.campaignViewPanel.layout.activeItem.id == itemId)
            return;
            
        this.campaignViewPanel.layout.setActiveItem(itemId);
        var toolbar = this.campaignViewPanel.layout.activeItem.getTopToolbar();
        var itemBaseId = this.campaignViewPanel.layout.activeItem.baseId;
        toolbar.get(itemBaseId + "-viewbutton-" + itemNo).toggle(true, false);
        
        var stuffToDisable = [
            toolbar.get(itemBaseId + "-advancedtogglebutton"),
            toolbar.get(itemBaseId + "-searchfield"),
            toolbar.get(itemBaseId + "-searchbutton"),
            toolbar.get(itemBaseId + "-clearsearchbutton")
        ];
        
        for (var i = 0; i<stuffToDisable.length; i++) {
            var toDis = stuffToDisable[i];
            if (toDis) {
                if (this.campaignViewPanel.layout.activeItem.usesAdvancedFilter) {
                    toDis.enable();
                } else {
                    toDis.disable();
                }
            }
        }
        this.switchAdvancedOptions();
    },

    doSearch: function() {
    
        var toolbar = this.campaignViewPanel.layout.activeItem.getTopToolbar();
        var itemBaseId = this.campaignViewPanel.layout.activeItem.baseId;
        var value = toolbar.get(itemBaseId + "-searchfield").getValue();
    
        if (value != '') {
            this.refreshData(0, value);
        } else {
            this.clearSearch();
        }
    },
    setSearch: function(val) {
        if (val !== undefined) {
            var toolbar = this.campaignViewPanel.layout.activeItem.getTopToolbar();
            var itemBaseId = this.campaignViewPanel.layout.activeItem.baseId;
            toolbar.get(itemBaseId + "-searchfield").setValue(val);
            this.doSearch();
        }
    },
    clearSearch: function() {
        var toolbar = this.campaignViewPanel.layout.activeItem.getTopToolbar();
        var itemBaseId = this.campaignViewPanel.layout.activeItem.baseId;
        toolbar.get(itemBaseId + "-searchfield").setValue("");
        this.refreshData();
    },
    
    switchAdvancedOptions: function(button, state) {
        
        var filterPossible = false;
        var activeItem = this.campaignViewPanel.layout.activeItem;
        if (activeItem && activeItem.usesAdvancedFilter) {
            filterPossible = true;
        }
        
        var showFilter = false;
        if (filterPossible) {
            var toolbar = this.campaignViewPanel.layout.activeItem.getTopToolbar();
            var itemBaseId = this.campaignViewPanel.layout.activeItem.baseId;
            var advancedToggleButton = toolbar.get(itemBaseId + "-advancedtogglebutton");
            if (advancedToggleButton) {
                showFilter = advancedToggleButton.pressed;
            }
        }
        if (filterPossible && !showFilter) {
            this.clearFilters();
        }
        
        this.optionsPanel.setVisible(showFilter);
        this.optionsPanel.ownerCt.doLayout();
    }

});

CQ.Ext.reg("mcmcampaignplanner", CQ.mcm.CampaignPlanner);

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/

/**
 * @class CQ.mcm.BrandsView
 * @extends CQ.Ext.Panel
 * The BrandsView shows all available brands.
 * @constructor
 * Creates a new Campaigns Overview.
 * @param {Object} config The config object
 * @since 5.5
 */
CQ.mcm.BrandsView = CQ.Ext.extend(CQ.Ext.Panel, {
    
    currentRootPath: null,

    constructor: function(config) {
        this.store = new CQ.Ext.data.JsonStore({
            root: 'brands',
            idProperty: 'id',
            remoteSort: true,
    
            fields: [
                'id', 
                'image', 
                'label',
                { name: 'campaigns', convert: function(value, record) {if(value) return value.split(','); else return new Array();} },
                'created',
                'updated'
            ]
        });
        
/*        var data = {brands: []};
        for(var i=0; i < 50; i++) {
            data.brands.push({
                id: "brand" + i,
                image: "/libs/cq/personalization/templates/campaign/thumbnail.png",
                label: "Travel for Free Brand " + i,
                campaigns: "Free Abroad Campaign 0, Free Abroad Campaign 1",
                created: "2011-08-15 00:00",
                updated: "2011-08-16 00:00"
            });
        }
        
        this.store.loadData(data);
*/            
        CQ.Util.applyDefaults(config,  {
            layout: "fit",
            border: false,
            cls: "cq-mcm-brandsview",
            items: [{
                xtype: "panel",
                autoScroll: true,
                border: false,
                items: [{
                    xtype: "dataview",
                    border: false,
                    store: this.store,
                    multiSelect: true,
                    singleSelect: true,
                    autoHeight: true,
                    overClass:'x-view-over',
                    itemSelector:'div.brand-thumb',
                    tpl: '<tpl for="."><div class="brand-thumb" id="{id}" title="{label}"><img src="{[CQ.HTTP.externalize(values.image)]}" style="height:55px;" /><p>{label}</p></div></tpl>',
                    listeners: {
                        selectionchange: function(view, selection) {
                            if(selection.length == 0) { // no selection
                                view.ownerCt.topToolbar.items.each(function(item, index, length) {
                                    item.setDisabled(item.noSelect === false);
                                });
                            } else if(selection.length > 1) { // multi selection
                                view.ownerCt.topToolbar.items.each(function(item, index, length) {
                                    item.setDisabled(item.multiSelect === false);
                                });
                            } else { // single selection
                                view.ownerCt.topToolbar.items.each(function(item, index, length) {
                                    item.setDisabled(item.singleSelect === false);
                                });
                            }
                        },
                        dblclick: function(view, index, node) {
                            CQ.event.EventAdmin.sendEvent( new CQ.event.Event( "com/day/mcm/SELECTIONCHANGE", {
                                path: "/content/campaigns/" + node.getAttribute("id"), 
                                label: node.getAttribute("title"),
                                resourceType: "mcm/components/brandpage"
                            }) );                            
                        }
                    }
                }],
                tbar: [ 
                    {
                        iconCls: 'cq-siteadmin-refresh',
                        handler: function() {this.handleRefresh();},
                        scope: this
                    },
                    "-",
                    { 
                        text: CQ.I18n.get("New..."),
                        handler: function() {this.handleNew();},
                        scope: this
                    },
                    { 
                        text: CQ.I18n.get("Properties") + "&hellip;",
                        handler: function() {this.handleEdit();},
                        scope: this,
                        disabled: true,
                        multiSelect: false,
                        singleSelect: true,
                        noSelect: false
                    },
                    "-",
                    { 
                        text: CQ.I18n.get("Delete"),
                        handler: function() {this.handleDelete();},
                        scope: this,
                        disabled: true,
                        multiSelect: true,
                        singleSelect: true,
                        noSelect: false
                    }
                ]
           }]
        });
        
        CQ.mcm.BrandsView.superclass.constructor.call(this, config);
        
        this.view = this.findByType("dataview")[0];
        
        CQ.event.EventAdmin.registerEventHandler("com/day/mcm/SELECTIONCHANGE", this.selectionChange, this);
    },
    selectionChange: function(event) {
        if(event.properties.resourceType != "mcmadmin/deck")
            return;

        this.currentRootPath =  event.properties.path;
        this.refreshData();
    },
    refreshData: function() {
        if (this.currentRootPath) {
            CQ.HTTP.get(this.currentRootPath + ".mcmbrands.json?",
                function(options, success, response) {
                    var data = CQ.HTTP.eval(response);
                    if(data)
                        this.store.loadData(data);
                }, this);
        }
            
        var data = {brands: []};

        this.store.loadData(data);
        
    },
    handleRefresh: function() {
        CQ.event.EventAdmin.sendEvent( new CQ.event.Event( "com/day/mcm/REFRESH", {
            path: this.currentRootPath
        }) );
        this.refreshData();
    },
    handleNew: function() {
        var dialog = CQ.wcm.Page.getCreatePageDialog(this.currentRootPath);
        dialog.responseScope = this;                               
        dialog.success = function(form, xhr) {
            console.log("success", form, xhr);
            var response = CQ.HTTP.buildPostResponseFromHTML(xhr.response);
            var path = response.headers[CQ.utils.HTTP.HEADER_PATH];

            CQ.HTTP.post(
                path + "/jcr:content",
                function(options, success, response) {
                    if (success) {
                        this.handleRefresh();
                    } else {
                        CQ.Ext.Msg.alert(
                            CQ.I18n.getMessage("Error"),
                            CQ.I18n.getMessage("Could not create brand.")
                        );
                    }
                },
                {
                },
                this
            );
        };
        dialog.failure = function() {
            CQ.Ext.Msg.alert(
                CQ.I18n.getMessage("Error"),
                CQ.I18n.getMessage("Could not create page.")
            );
        };
        dialog.show();
    },
    handleEdit: function() {
        if (this.view.getSelectionCount() > 0) {
            if (this.view.getSelectionCount() > 1) {
                CQ.Ext.Msg.alert(CQ.I18n.getMessage("Selection"), CQ.I18n.getMessage("Please select one item only."));
            } else {
                var selection = this.view.getSelectedRecords();
                var that = this;
                var refresher = function() {that.handleRefresh();};
                CQ.mcm.Util.openDialog(this.currentRootPath + "/" + selection[0].id + "/jcr:content", 
                    "/libs/mcm/components/brandpage/dialog.infinity.json", false, refresher);
        }
        }
    },
    handleDelete: function() {
        if(this.view.getSelectionCount() > 0) {
            var selection = this.view.getSelectedRecords();
            
            var data = {
                ":operation": "delete",
                ":applyTo": []
            };
            for(var i=0; i < selection.length; i++) 
                data[":applyTo"].push(selection[i].id);
                
            CQ.HTTP.post(this.currentRootPath, function() {
                this.handleRefresh();
            }, data, this);
        }
    }
});

CQ.Ext.reg("mcmbrandsview", CQ.mcm.BrandsView);

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/

/**
 * @class CQ.mcm.CampaignsView
 * @extends CQ.Ext.Panel
 * The CampaignsView shows all campaigns for a specific brand.
 * @constructor
 * Creates a new Campaigns Overview.
 * @param {Object} config The config object
 * @since 5.5
 */
CQ.mcm.CampaignsView = CQ.Ext.extend(CQ.Ext.Panel, {
    granularity: "month",
    startDay: new Date().dateOnly(),

    baseId: "mcm-campaigns-view",

    constructor: function(config) {
        var that = this;

        var dates = this.getDates();

        CQ.Util.applyDefaults(config,  {
                layout: "fit",
                border: false,
                cls: "cq-mcm-campaignsview",
                items: [{
                    xtype: "mcmganttview",
                    timelineStart: dates.start,
                    timelineEnd: dates.end,
                    enableDoubleClick: true,
                    listeners: {
                        eventdblclick: function(record) {
                            CQ.event.EventAdmin.sendEvent( new CQ.event.Event( "com/day/mcm/REQSELECTIONCHANGE", {
                                path: that.currentRootPath + "/" + record.data.id
                            }) );
                        },
                        selectionchange: function(view, record) {
                            if(record != null) {
                                view.ownerCt.topToolbar.items.each(function(item, index, length) {
                                    item.setDisabled(item.singleSelect === false);
                                });
                            }else {
                                view.ownerCt.topToolbar.items.each(function(item, index, length) {
                                    item.setDisabled(item.noSelect === false);
                                });
                            }
                        }
                    }
                }],
                tbar: [ 
                    {
                        iconCls: 'cq-siteadmin-refresh',
                        handler: function() {this.handleRefresh();},
                        scope: this
                    },
                    "-",
                    { 
                        text: CQ.I18n.getMessage("New..."),
                        handler: function() {this.handleNew();},
                        scope: this
                    },
                    { 
                        text: CQ.I18n.getMessage("Properties")+"&hellip;",
                        handler: function() {that.handleProperties();},
                        disabled: true,
                        multiSelect: false,
                        singleSelect: true,
                        noSelect: false
                    },
                    "-",
                    { 
                        text: CQ.I18n.getMessage("Delete"),
                        handler: function() {this.handleDelete();},
                        scope: this,
                        disabled: true,
                        multiSelect: true,
                        singleSelect: true,
                        noSelect: false
                    },
                    "-",
                    {
                        text: CQ.I18n.getMessage("Week"),
                        handler: this.showWeek,
                        toggleGroup: "granularityGroup",
                        enableToggle: true,
                        allowDepress: false,
                        pressed: this.granularity == "week",
                        scope: this
                    },
                    {
                        text: CQ.I18n.getMessage("Month"),
                        handler: this.showMonth,
                        toggleGroup: "granularityGroup",
                        enableToggle: true,
                        allowDepress: false,
                        pressed: this.granularity == "month",
                        scope: this
                    },
                    {
                        text: CQ.I18n.getMessage("Quarter"),
                        handler: this.showQuarter,
                        toggleGroup: "granularityGroup",
                        enableToggle: true,
                        allowDepress: false,
                        pressed: this.granularity == "quarter",
                        scope: this
                    },
                    "-",
                    {
                        text: "&#x25C0;",
                        handler: this.moveDateBackward,
                        scope: this
                    },
                    {
                        text: "&#x25B6;",
                        handler: this.moveDateForward,
                        scope: this
                    },
                    {
                        text: CQ.I18n.getMessage("Today"),
                        handler: this.showToday,
                        scope: this
                    }
                ]
        });

        CQ.mcm.CampaignsView.superclass.constructor.call(this, config);

        this.chart = this.findByType("mcmganttview")[0];

        CQ.event.EventAdmin.registerEventHandler("com/day/mcm/SELECTIONCHANGE", this.selectionChange, this);
    },

    selectionChange: function(event) {
        if(event.properties.resourceType != "mcm/components/brandpage")
            return;

        this.currentRootPath = event.properties.path;
        this.refreshData();
    },

    refreshData: function() {
        CQ.HTTP.get(this.currentRootPath + "/jcr:content.chart.json?",
            function(options, success, response) {
                var data = CQ.HTTP.eval(response);
                if(data)
                    this.chart.updateData(data);
            }, this);

        var data = {events: []};
        this.chart.updateData(data);
    },

    handleRefresh: function() {
        CQ.event.EventAdmin.sendEvent( new CQ.event.Event( "com/day/mcm/REFRESH", {
            path: this.currentRootPath
        }) );
        this.refreshData();
    },

    handleNew: function() {
        var dialog = CQ.wcm.Page.getCreatePageDialog(this.currentRootPath);
        dialog.responseScope = this;                               
        dialog.success = function(form, xhr) {
            console.log("success", form, xhr);
            var response = CQ.HTTP.buildPostResponseFromHTML(xhr.response);
            var path = response.headers[CQ.utils.HTTP.HEADER_PATH];

            CQ.HTTP.post(
                path + "/jcr:content",
                function(options, success, response) {
                    if (success) {
                        this.showToday();
                        this.handleRefresh();

                    } else {
                        CQ.Ext.Msg.alert(
                            CQ.I18n.getMessage("Error"),
                            CQ.I18n.getMessage("Could not set teaser for this week.")
                        );
                    }
                },
                {
                },
                this
            );
        };
        dialog.failure = function() {
            CQ.Ext.Msg.alert(
                CQ.I18n.getMessage("Error"),
                CQ.I18n.getMessage("Could not create page.")
            );
        };
        dialog.show();
    },

    handleDelete: function() {
        var selection = this.chart.currentSelection;
        if(selection != null) {
            var data = {
                ":operation": "delete"
            };

            CQ.HTTP.post(this.currentRootPath + "/" + selection.record.id, function() {
                this.handleRefresh();
            }, data, this);
        }
    },

    handleProperties: function() {
        var selection = this.chart.currentSelection;
        if(selection != null) {
            var that = this;
            var refresher = function() {that.handleRefresh();};
            var propDlgPath = selection.record.data.propertiesDialogPath;
            var compPath = this.currentRootPath + "/" + selection.record.id + "/jcr:content";

            if (propDlgPath) {
            	CQ.mcm.Util.openDialog(compPath, propDlgPath + ".infinity.json", false, refresher,
                        function() {CQ.Ext.Msg.alert("Error", "Nothing done, please connect to an account.");} );
            } else {
            	var url = "libs/" + selection.record.data["sling:resourceType"] + "/dialog.infinity.json";
            	CQ.mcm.Util.openDialog(compPath, url, false, refresher);
            }
        }
    },

    showWeek: function() {
        this.granularity = "week";
        this.updateTimespan();
    },

    showMonth: function() {
        this.granularity = "month";
        this.updateTimespan();
    },
    
    showQuarter: function() {
        this.granularity = "quarter";
        this.updateTimespan();
    },
    
    moveDateBackward: function() {
        if(this.granularity == "week")
            this.startDay = this.startDay.add(Date.DAY, -7)
        else if(this.granularity == "month")
            this.startDay = this.startDay.add(Date.MONTH, -1)
        else if(this.granularity == "quarter")
            this.startDay = this.startDay.add(Date.MONTH, -3)

        this.updateTimespan();
    },
    
    moveDateForward: function() {
        if(this.granularity == "week")
            this.startDay = this.startDay.add(Date.DAY, 7)
        else if(this.granularity == "month")
            this.startDay = this.startDay.add(Date.MONTH, 1)
        else if(this.granularity == "quarter")
            this.startDay = this.startDay.add(Date.MONTH, 3)

        this.updateTimespan();
    },

    getDates: function() {
        var startDay, endDay;
        if(this.granularity == "week") {
            var startOfWeek = Number(CQ.I18n.getMessage("0", null, "Start day for week view in calendar (0=Sunday, 1=Monday, etc.)"));
            // find weekstart
            startDay = this.startDay;
            while (startOfWeek != Number(startDay.format("w"))) {
                startDay = startDay.add(Date.DAY, -1);
            }
            endDay = startDay.add(Date.DAY, 7);
        } else if(this.granularity == "month") {

            var lastDateOfMonth = this.startDay.getLastDateOfMonth();
            var lengthOfMonth = lastDateOfMonth.getDate();

            var startModification = 0;
            var endModification = 0;
            // Goal: Always show 33 days!
            if (lengthOfMonth == 31) {
                startModification = -1;
                endModification = 1;
            } else if (lengthOfMonth == 30) {
                startModification = -1;
                endModification = 2;
            } else if (lengthOfMonth == 29) {
                startModification = -2;
                endModification = 2;
            } else if (lengthOfMonth == 28) {
                startModification = -2;
                endModification = 3;
            } else {
                // strange length of month = show month without modifications
                startModification = 0;
                endModification = 0;
            }

            startDay = this.startDay.getFirstDateOfMonth().add(Date.DAY, startModification);
            endDay = lastDateOfMonth.add(Date.DAY, endModification).add(Date.DAY, 1);

        } else if(this.granularity == "quarter") {
            startDay = this.startDay.add(Date.MONTH, -1 * ((this.startDay.format("n") - 1) % 3)).getFirstDateOfMonth();
            endDay = startDay.add(Date.MONTH, 3);
        }
        return {start: startDay, end: endDay};
    },

    updateTimespan: function() {
        var dates = this.getDates();
        this.chart.setTimespan(dates.start, dates.end);
        
    },
    
    showToday: function() {
        try{
        this.startDay = new Date().dateOnly();
        this.updateTimespan();
        }catch(e){
        console.error(e);
        }
    }
    
});

CQ.Ext.reg("mcmcampaignsview", CQ.mcm.CampaignsView);

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/

/**
 * The <code>CQ.mcm.cal.CampaignLens</code> renders the month view
 * of the calendar
 * @class CQ.mcm.cal.CampaignLens
 * @extends CQ.mcm.cal.CalendarLens
 */
CQ.mcm.cal.CampaignLens = CQ.Ext.extend(CQ.mcm.cal.CalendarLens, {

    /**
     * first date of displayed month
     * @private
     */
    monthStart: null,

    /**
     * start display date
     * @private
     */
    start: null,

    /**
     * end display date (+1 day)
     * @private
     */
    end: null,

    /**
     * internal month panel
     * @private
     */
    panel: null,

    constructor: function(config) {
        // custom calendar qb query, hence custom fields as well (on/offTime instead of start/end)
        var fields = [
            // we cannot use jcr:title/jcr:path directly as the xtemplate used by
            // the DataViewLens cannot handle field names with ':' inside
            { "name": "path", "mapping": "jcr:path" },
            { "name": "jcr:permissions" },

            { "name": "pagePath", "mapping": "jcr:path",
              "convert": function(v) {
                  return v.substring(0, v.length - "/jcr:content".length);
              }
            },

            { name: "campaignpath", "mapping": "jcr:path",
              convert: function(v) {
                    // getting: /content/campaigns/(-brand-/)?-campaign-/teaserpagename/jcr:content
                    // want substring till end of campaign
                    var pos = v.indexOf("/jcr:content");
                    // go back till next '/'
                    pos = pos - 1;
                    while (pos > 0 && v.charAt(pos) != '/') {
                        pos--;
                    }
                    if (v.charAt(pos) == '/') {
                        return v.substring(0, pos);
                    } else {
                        return "";
                    }
              }
            },

            { name: "defaultRecipientList" },

            { name: "type", "mapping": "sling:resourceType",
              convert: function(v) {
                    if (v == "cq/personalization/components/teaserpage") {
                        return "teaser";
                    } else if (v == "twitter/components/post") {
                        return "twitter";
                    } else {
                        // TODO here the type determination should use supertypes (which needs to run on server)
                        return "newsletter";
                    }
              }
            },

            "accountPath",

            { "name": "title", "mapping": "jcr:title" },

            { "name": "onTime",  "type": "date" },
            { "name": "offTime", "type": "date" }
        ];
        this.store = new CQ.Ext.data.JsonStore({
            "fields": fields
        });

        config = CQ.Util.applyDefaults(config, {
            "autoScroll": true,
            "renderTo": CQ.Util.ROOT_ID,
            "border": false,
//            "height": CQ.mcm.cal.Calendar.getLensHeight(),
            "headerHeight": 45, // height of the day names header
            "headerBorder": 2, // css border vertical sum for day names header
            "dayBorder": 1,    // css border vertical sum for day cell
            "dayHeaderHeight": 13, // height of the day header showing the day number
            "teaserHeight": 20 // height of a single event inside a day cell
        });

        CQ.mcm.cal.CampaignLens.superclass.constructor.call(this, config);

        this.touchpointStore.on("load", function() {
            this.renderTable();
        }, this);

        var colors = ["d3ea9a", "d96666", "maroon", "99BBE8"];
        var colIndex = 0;

        // name => title
        this.campaigns = {};
        var json = CQ.HTTP.eval("/content/campaigns.2.json");
        for (var n in json) {
            if (!json.hasOwnProperty(n)) {
                continue;
            }
            var o = json[n];
            if (typeof o === "object") {
                if (o["jcr:primaryType"] === "cq:Page") {
                    this.campaigns[n] = {
                        title: o["jcr:content"]["jcr:title"],
                        color: colors[colIndex]
                    };
                    // next color, round-robin
                    colIndex++;
                    if (colIndex >= colors.length) {
                        colIndex = 0;
                    }
                }
            }
        }
        // console.log("Lens campaigns:", this.campaigns);
    },

    // public calendar lens api

    prev: function() {
        // Note: rendering is delayed up to renderTable(), called upon querybuilder response
        return this.monthStart.add(Date.MONTH, -1);
    },

    next: function() {
        // Note: rendering is delayed up to renderTable(), called upon querybuilder response
        return this.monthStart.add(Date.MONTH, 1);
    },

    setDate: function(date) {
        var startOfWeek = CQ.mcm.cal.Calendar.getStartOfWeek();

        var newMonthStart = date.getFirstDateOfMonth();
        // find the first week start on or before the month start day => display start
        // calculate the proper start week day depending on the configured start weekday
        var startWeekDay = newMonthStart.getDay() - startOfWeek;
        if (startWeekDay < 0) {
            startWeekDay += 7;
        }
        this.start = newMonthStart.add(Date.DAY, - startWeekDay);

        var newMonthEnd = date.getLastDateOfMonth();
        // find the first week end after or on the month end => display end
        var endWeekDay = newMonthEnd.getDay() - startOfWeek;
        if (endWeekDay < 0) {
            endWeekDay += 7;
        }
        // Note: the end will be the day after the last day displayed, in order
        // to be used for the upper bound of the query and for doing getTime() < end.getTime()
        this.end = newMonthEnd.add(Date.DAY, 6 - endWeekDay + 1);

        var oldMonthStart = this.monthStart;
        this.monthStart = newMonthStart;

        var doUpdate = (!oldMonthStart || (oldMonthStart.getTime() != this.monthStart.getTime()));

        // HACK: modify query
        var qb = CQ.search.Util.getQueryBuilder();

        function removeHidden(name) {
            var form = qb.form;
            var field = form.findField(name);
            if (field) {
                form.remove(field);
                field.destroy();
            }
        }

        qb.setHidden("type", "cq:PageContent");
        if(this.planner.currentRootPath.length > 0)
            qb.setHidden("path", this.planner.currentRootPath);
        else qb.setHidden("path", "/content/campaigns");
        qb.setHidden("1_group.p.or", "true");
        // TODO use plugin architecture here - probably by doing the search in the experiences servlet
        qb.setHidden("1_group.1_property", "sling:resourceType");
        qb.setHidden("1_group.1_property.value", "cq/personalization/components/teaserpage");
        qb.setHidden("1_group.2_property", "sling:resourceType");
        qb.setHidden("1_group.2_property.value", "mcm/components/newsletter/page");
        qb.setHidden("1_group.3_property", "teaserPageType");
        qb.setHidden("1_group.3_property.value", "newsletter");
        qb.setHidden("1_group.4_property", "teaserPageType");
        qb.setHidden("1_group.4_property.value", "tweet");

        // clear unused
        removeHidden("event.from");
        removeHidden("event.to");
        removeHidden("1_orderby");
        removeHidden("2_orderby");
        removeHidden("group.1_path");
        removeHidden("group.p.or");

        qb.setHidden("2_group.p.or", "true");
        qb.setHidden("2_group.property", "onTime");
        qb.setHidden("2_group.property.operation", "exists");
        qb.setHidden("2_group.property.value", "false");
        qb.setHidden("2_group.daterange.property", "onTime");
        qb.setHidden("2_group.daterange.upperOperation", "<");
        // overwrite function
        CQ.mcm.cal.Calendar.setUpperDateBound = function(date) {
            qb.setHidden("2_group.daterange.upperBound", date.format("Y-m-d"));
        };

        qb.setHidden("3_group.p.or", "true");
        qb.setHidden("3_group.property", "offTime");
        qb.setHidden("3_group.property.operation", "exists");
        qb.setHidden("3_group.property.value", "false");
        qb.setHidden("3_group.daterange.property", "offTime");
        qb.setHidden("3_group.daterange.lowerOperation", ">=");
        // overwrite function
        CQ.mcm.cal.Calendar.setLowerDateBound = function(date) {
            qb.setHidden("3_group.daterange.lowerBound", date.format("Y-m-d"));
        };

        qb.setHidden("orderby", "@onTime");

        return doUpdate;
    },

    getDateDisplayText: function() {
        // eg. "December 2009"
        return this.monthStart.format(CQ.mcm.cal.Calendar.getDatePattern("month"));
    },

    getStartDate: function() {
        return this.start;
    },

    getEndDate: function() {
        return this.end;
    },

    // public lens api

    loadData: function(data) {

        try{
            this.store.loadData(data.hits);
            this.renderTable();
        }catch(e) {
            console.error(e);
        }
    },

    getSelection: function() {
        // no selection at the moment for calendar events
        return [];
    },

    // internal stuff

    oneDayBefore: function(date) {
        return date.add(Date.DAY, -1);
    },

    renderTable: function() {
        var cal = CQ.mcm.cal.Calendar;

        // recreate month panel
        if (this.panel) {
            this.remove(this.panel);
        }

        var weeks = [], i = 0;
        // current month, in weeks
        for (var d = this.start; d.getTime() <= this.end.getTime(); d = d.add(Date.DAY, 7)) {
            weeks[i++] = d;
        }

        this.panel = new CQ.Ext.Panel({
            "cls": "cq-calendar-month cq-calendar-mcm-border",
            "border": false,
            "hideBorders": true,
            "layout": "table",
//            "height": this.height,
            height: "100%",
            "layoutConfig": {
                "columns": weeks.length // 1 col for campaigns + weeks-1
            }
        });
        this.add(this.panel);

        // header row ----------------------------------------------------------

        this.panel.add(new CQ.Ext.BoxComponent({
                cellCls: "cq-calendar-mcm-col-header-cell",
                autoEl: {
                    tag: "div",
                    html: "",
                    cls: "cq-calendar-header-title",
                    height: this.headerHeight
                }
        }));
        var baseColors = ["cq-calendar-mcm-uneven-bg", ""];
        var colorChooser = 0;
        var weekExtraCls = [];
        for (var i=0; i < weeks.length - 1; i++) {
            weekExtraCls.push(baseColors[colorChooser]);
            colorChooser = (colorChooser + 1) % baseColors.length;
            var weekStr;
            var weekEnd = this.oneDayBefore(weeks[i+1]);
            if (weeks[i].getMonth() != weekEnd.getMonth()) {
                weekStr = CQ.mcm.cal.multiDateFormat(
                    "1F 1d - 2M 2d",
                    [weeks[i], weekEnd]
                );
            } else {
                weekStr = CQ.mcm.cal.multiDateFormat(
                    "1F 1d - 2d",
                    [weeks[i], weekEnd]
                );
            }

            // calculate the week of year based on the next day to prevent any issues with the startOfWeek value
            var weekOfYear = weeks[i].add(Date.DAY, 1).getWeekOfYear();
            var cwString = "CW " + weekOfYear;
            var currentWeek = this.inWeek(new Date(), weeks[i], weekEnd);
            var yellowStyleStr = currentWeek ? ' style="background-image: url(\'' + CQ.HTTP.externalize('/libs/mcm/widgets/themes/default/resources/grid3-hrow2-green.gif') + '\');" ' : '';
            var lighterYellowStyleStr = currentWeek ? ' style="background-color: #ebf0de;" ' : '';

            this.panel.add(new CQ.Ext.BoxComponent({
                autoEl: {
                    tag: "div",
                    html: new CQ.Ext.XTemplate('<div class="x-grid3-header cq-calendar-mcm-cw-header"{style1}>{cw}</div>'
                        + '<div class="cq-calendar-mcm-week-header"{style2}>{weekdates}</div>').apply({
                    cw: cwString,
                    weekdates: weekStr,
                    style1: yellowStyleStr,
                    style2: lighterYellowStyleStr
                    }),
                    height: this.headerHeight
                }
            }));
        }

        // campaign rows -----------------------------------------------------

        var campaignCount = 0;
        for (var c in this.campaigns) {
            campaignCount++;
        }

        // old: this.rowHeight = Math.floor((this.height - this.headerHeight - this.headerBorder) / campaignCount) - this.dayBorder;
        this.rowHeight = 80;

        var that = this;
        // one row per touchpoint
        this.touchpointStore.each(function(touchpoint) {
            var parentPath = this.planner.currentRootPath;

            // add cell to touchpoint col
            var colHtml = "<b>" + touchpoint.data.title + "</b><br/>";
            if(touchpoint.data.pagetitle && touchpoint.data.pagetitle != "")
                colHtml += CQ.I18n.get("Page: ") + "<a href='" + CQ.HTTP.externalize(touchpoint.data.pageuri) + ".html'>" + touchpoint.data.pagetitle + "</a><br/>";
            if(touchpoint.data.channel && touchpoint.data.channel != "")
                colHtml += "<span class='cq-campaignlens-channel-header-text'>" + CQ.I18n.get("Channel: ") + touchpoint.data.channel + "</span>";

            var teasers = this.store.queryBy(function(teaser, id) {
                // return true if teaser runs on this touchpoint (channel matches)
                return (teaser.get("type") == "newsletter" && touchpoint.data.id == teaser.get("defaultRecipientList"))
                    || (teaser.get("type") == "teaser" && touchpoint.data.channel == "Web")
                    || (teaser.get("type") == "twitter" && touchpoint.data.id == teaser.get("accountPath"));
            });
            // once a teaser was drawn it needs to occupy the whole row, this stores these positions
            var teaserInRowList = [];
            var teaserInRowMap = {};
            var cells = []; // filled for the drawing afterwards
            var maxTeasersInCell = 0; // need to find this before drawing, so cannot draw and get info in the same run

            // week columns
            for (var i=0; i < weeks.length - 1; i++) {
                var teaser = new Array();
                var weekEnd = this.oneDayBefore(weeks[i+1]);

                var currentWeek = this.inWeek(new Date(), weeks[i], weekEnd);

                var matchingTeaserMap = {};

                teasers.each(function(t) {
                    var on = t.get("onTime");
                    var off = t.get("offTime");
                    if(!on && !off) {
                        t.set("onTime", this.start.add(Date.DAY, -1));
                        t.set("offTime", this.end.add(Date.DAY, 1));
                        teaser.push(t);
                        matchingTeaserMap[t.get("path")] = true;
                    }else if( (off && off.getTime() > weeks[i].getTime() && on.getTime() < weeks[i+1].getTime()) || // time span event
                            (on.getTime() >= weeks[i].getTime() && on.getTime() < weeks[i+1].getTime()) ){ // time point event
                        if(! off)
                            t.set("offTime", on);
                        teaser.push(t);
                        matchingTeaserMap[t.get("path")] = true;
                    }
                }, this);

                var html = [];
                var highestIndex = -1;

                for (var j = 0; j < teaserInRowList.length; j++) {
                    var curr = teaserInRowList[j];
                    if ( curr && matchingTeaserMap[curr.get("path")] ) {
                        // ok, should be drawn normally
                        highestIndex = j;
                    } else {
                        // free entry in row
                        if (curr) {
                            delete teaserInRowMap[curr.get("path")];
                        }
                        teaserInRowList[j] = null;
                    }
                }
                // shrink the list:
                if (highestIndex < teaserInRowList.length-1) {
                    for (var j = teaserInRowList.length-1; j>highestIndex; j--) {
                        teaserInRowList.pop();
                    }
                }

                var currentWeekStyle = null;
                if (currentWeek) {
                    currentWeekStyle = {"background-color": "#faffee"};
                }
                var firstEmptyTry = 0;
                try {
                    for(var teaserI = 0; teaserI < teaser.length; teaserI++) {
                       var aTeaser = teaser[teaserI];

                       if ( ! teaserInRowMap[aTeaser.get("path")] ) {
                           // find empty spot to put teaser into:
                           while (firstEmptyTry < teaserInRowList.length
                               && teaserInRowList[firstEmptyTry] != null) {

                               firstEmptyTry++;
                           }
                           if (firstEmptyTry == teaserInRowList.length) {
                               teaserInRowList.push(aTeaser);
                           } else {
                               teaserInRowList[firstEmptyTry] = aTeaser;
                           }

                           teaserInRowMap[aTeaser.get("path")] = true;
                        }
                    }

                if (teaser.length > 0 || html.length > 0) {

                    for (var j = 0; j < teaserInRowList.length; j++) {
                        var curr = teaserInRowList[j];
                        if ( curr ) {
                            // ok, should be drawn normally
                            var color = touchpoint.data.color;
                            if (curr.get("campaignpath") != this.planner.currentRootPath) {
                                color = "888";
                            }
                            html.push(
                                this.createTeaserDiv(curr, weeks[i], weeks[i+1], color,
                                    i==0 /* first week? */) );
                        } else {
                            // only occupy space
                            html.push(
                                this.createDummyTeaserDiv(weeks[i], weeks[i+1]));
                        }
                    }

                    if (teaserInRowList.length > maxTeasersInCell) {
                        maxTeasersInCell = teaserInRowList.length;
                    }

                    var cellDef = {
                        emptyCell: false,
                        onTime: weeks[i],
                        offTime: weeks[i+1],
                        html: html,
                        currentWeekStyle: currentWeekStyle,
                        weekExtraCls: weekExtraCls[i]
                    };
                    cells.push(cellDef);

                } else {
                    var cellDef = {
                        emptyCell: true,
                        onTime: weeks[i],
                        offTime: weeks[i+1],
                        currentWeekStyle: currentWeekStyle,
                        weekExtraCls: weekExtraCls[i]
                    };
                    cells.push(cellDef);
                }
                } catch (e) {
                    console.log("during assembly of information: ", e);
                }
            }


            // now do the drawing
            try {
            var rowHeight = this.rowHeight;
            var neededVSpace =
                maxTeasersInCell * this.teaserHeight // space for teasers
                + maxTeasersInCell * 2 // 2px space between teasers
                + 5 + 5; // lower border and upper border
            if (neededVSpace > rowHeight) {
                rowHeight = neededVSpace;
            }

           this.panel.add(new CQ.Ext.BoxComponent({
//                cellStyle: "vertical-align: middle;",
                cellCls: "cq-campaign-touchpoint-row-header-cell",
                autoEl: {
                    tag: "div",
                    href: parentPath + ".html",
                    html: colHtml, //this.campaigns[c].title,
                    cls: "cq-calendar-mcm-row-header-cell",
                    height: rowHeight
                }
            }));

            for (var i=0; i < cells.length; i++) {
                var currCell = cells[i];

                if ( ! currCell.emptyCell) {

                    // max to ensure that margins are covered (only approximately)
                    var emptyVSpace = Math.max(10,rowHeight - currCell.html.length*(2+this.teaserHeight));
                    currCell.html.push({
                        html: "",
                        cls: "cq-campaign-empty-teaser-cell",
                        height: emptyVSpace,
                        style: "height: " + emptyVSpace + "px;",
                        // Note: domhelper does not allow to set real functions for event handler, not even with "useDom=true"
                        onclick: "CQ.mcm.cal.CampaignLens.handleCreatePageDialogClick(event, '" + this.id + "','" + parentPath + "', "
                            + currCell.onTime.getTime() + ", " + currCell.offTime.getTime() + ")"
                    });

                    this.panel.add(new CQ.Ext.BoxComponent({
                        cellCls: "cq-campaign-touchpoint-row-cell",
                        html: currCell.html,
                        cls: "cq-campaign-teaser-cell " + currCell.weekExtraCls,
                        height: rowHeight,
                        style: currCell.currentWeekStyle
                    }));
                } else {
                    this.panel.add(new CQ.Ext.BoxComponent({
                        cellCls: "cq-campaign-touchpoint-row-cell",
                        html: "",
                        cls: "cq-campaign-teaser-cell cq-campaign-empty-teaser-cell " + currCell.weekExtraCls,
                        style: currCell.currentWeekStyle,
                        height: rowHeight,
                        onTime: currCell.onTime,
                        offTime: currCell.offTime,
                        parentPath: parentPath,
                        listeners: {
                            render: function(c) {
                                var el = c.getEl();
                                el.unselectable();
                                var date = this.createDate;
                                that.setOnClickPageCreateDialog(el, this);
                            }
                        }
                    }));
                }

            }
            } catch (e) {
                console.log("during drawing:", e);
            }


        }, this);


        this.findParentByType("lensdeck").doLayout();
    },

    setOnClickPageCreateDialog: function(where, scope) {
        var that = this;
        where.on("click", function() {
            CQ.mcm.cal.CampaignLens.createPageDialog(that.id, this.parentPath, this.onTime, this.offTime);
        }, scope);
    },

    inWeek: function(date, weekStart, weekEnd) {
        var t = date.getTime();
        return t >= weekStart.getTime() && t <= weekEnd.getTime();
    },

    createDummyTeaserDiv: function(weekStart, weekEnd) {
        return this.createTeaserDiv(null, weekStart, weekEnd, -1, null);
    },

    createTeaserDiv: function(teaser, weekStart, weekEnd, color, firstDisplayedWeek) {

        var spritesURL = CQ.HTTP.externalize("/libs/cq/ui/resources/sprites");

        try {

        var starts = null;
        var ends = null;
        var timePointEvent = null;

        var h = this.teaserHeight;

        var elemStyle = "height: " + h + "px; line-height: " + h + "px;";

        if (color != -1) {
            starts = this.inWeek(teaser.get("onTime"), weekStart, weekEnd);
            ends = this.inWeek(teaser.get("offTime"), weekStart, weekEnd);
            timePointEvent = (teaser.get("onTime").getTime() == teaser.get("offTime").getTime());

            var elemTitle = teaser.get("title");
            if(timePointEvent) {
                elemStyle += "color: #315c00;";//"color: #" + color + ";";
                elemTitle = teaser.get("onTime").format("D d") + ": " + elemTitle;

            } else elemStyle += "color: #315c00;background-color: #" + color + ";";


            var elem = {
                tag: "a",
                href: "#",
                cls: "cq-calendar-month-event all-day cq-ellipsis",
                style: elemStyle,
                title: teaser.get("title")
            };

            // Note: domhelper does not allow to set real functions for event handler, not even with "useDom=true"
            elem.onclick = "CQ.mcm.cal.CampaignLens.editEvent(event, '" + this.id + "', '" + teaser.id + "')";


            if (starts || firstDisplayedWeek) {
                elem.html = elemTitle;
                if (!starts && firstDisplayedWeek) {
                    elem.style += "padding-left: 3px; ";
                }
            }
        } else {
            // placeholder to keep the row empty
            var elem = {
                tag: "a",
                href: "#",
                cls: "cq-campaign-empty-teaser-cell cq-calendar-month-event all-day cq-ellipsis",
                style: elemStyle
            };
            // Note: domhelper does not allow to set real functions for event handler, not even with "useDom=true"
            elem.onclick = "CQ.mcm.cal.CampaignLens.handleCreatePageDialogClick(event, '" + this.id + "','" + this.planner.currentRootPath + "', "
                + weekStart.getTime() + ", " + weekEnd.getTime() + ")";
        }

        var leftDiv = { tag: "div", style: "margin-bottom: 2px; ", isEvent: true };

        if(color == -1) {
            // create placeholder-div
            var rightDiv = { tag: "div" };
            leftDiv.children = [rightDiv, elem];
            rightDiv.style = "width: 14px; height: " + h + "px;float: left; ";

        } else if (timePointEvent) {
            var rightDiv = { tag: "div" };
            leftDiv.children = [rightDiv, elem];

            rightDiv.style = "margin-left: 3px; ";
//            rightDiv.style += "padding-left: 7px; ";
            rightDiv.style += "background: transparent url(" + spritesURL + ".14." + h + ".roundrect.0.0.14.14.10.F." + color + ".png) no-repeat 0 3px;";
            rightDiv.style += "margin-right: 3px; ";
//            rightDiv.style += "padding-right: 7px; ";
            rightDiv.style += "width: 14px; height: " + h + "px;float: left; ";
        } else {

            var rightDiv = { tag: "div" };
            leftDiv.children = [rightDiv];
            rightDiv.children = [elem];

            if (starts) {
                leftDiv.style += "margin-left: 3px; ";
                leftDiv.style += "padding-left: 7px; ";
                leftDiv.style += "background: transparent url(" + spritesURL + ".7." + h + ".roundrect.0.0.14." + h + ".10.F." + color + ".png) no-repeat 0 0;";
            }

            if (ends) {
                rightDiv.style = "margin-right: 3px; ";
                rightDiv.style += "padding-right: 7px; ";
                rightDiv.style += "background: transparent url(" + spritesURL + ".7." + h + ".roundrect.-7.0.14." + h + ".10.F." + color + ".png) no-repeat right 0;";
            }
        }

        return leftDiv;

        } catch (e) {
            console.log(e);
        }
    }

});

//
// STATIC methods, called directly from HTML
//

CQ.mcm.cal.CampaignLens.handleCreatePageDialogClick = function(ev, id, parentPath, weekStartMillis, weekEndMillis) {
    var weekStart = new Date(weekStartMillis);
    var weekEnd = new Date(weekEndMillis);

    var e = CQ.Ext.EventObject.setEvent(ev);
    e.stopEvent();
    CQ.mcm.cal.CampaignLens.createPageDialog(id, parentPath, weekStart, weekEnd);
};

CQ.mcm.cal.CampaignLens.createPageDialog = function(campaignLensId, parentPath, onTime, offTime) {
    CQ.mcm.Util.createPageAndOpenPropsDialog("Create Experience", parentPath, function() {
            CQ.mcm.cal.CampaignLens.refresh(campaignLensId, parentPath);
    },
    function() {
        CQ.Ext.Msg.alert(
            CQ.I18n.getMessage("Error"),
            CQ.I18n.getMessage("Could not create page.")
        );
    },
    this,
    {
        "onTime": onTime.format('Y-m-d\\TH:i:s.000P'),
        "offTime": offTime.format('Y-m-d\\TH:i:s.000P'),
        "onTime@TypeHint": "Date",
        "offTime@TypeHint": "Date"
    });
};

CQ.mcm.cal.CampaignLens.refresh = function(campaignLensId, pathToRefresh) {

    var campaignLens = CQ.Ext.getCmp(campaignLensId);
    if (campaignLens && campaignLens.planner) {
        campaignLens.planner.refreshData();
    }

    CQ.event.EventAdmin.sendEvent( new CQ.event.Event( "com/day/mcm/REFRESH", {
        path: pathToRefresh
    }) );

    CQ.mcm.cal.Calendar.update();
};

CQ.mcm.cal.CampaignLens.editEvent = function(ev, id, teaserId) {
    var e = CQ.Ext.EventObject.setEvent(ev);
    e.stopEvent();

    var campaignLens = CQ.Ext.getCmp(id);
    if (!campaignLens) {
        return;
    }
    var teaser = campaignLens.store.getById(teaserId);
    if (!teaser) {
        return;
    }

    var dialog;

    var config = {
        xtype: "dialog",
        buttons: [
            {
                xtype: "button",
                text: CQ.I18n.getMessage("Delete"),
                handler: function() {
                    CQ.Ext.Msg.confirm(
                        CQ.I18n.getMessage("Delete teaser"),
                        CQ.I18n.getMessage("Are you sure you want to delete this teaser?"),
                        function (button) {
                            if (button == "yes") {
                                dialog.hide();
                                CQ.Ext.Ajax.request({
                                    "url":CQ.HTTP.externalize("/bin/wcmcommand"),
                                    "method":"POST",
                                    "callback":function(options, success, xhr) {
                                        var response = CQ.HTTP.buildPostResponseFromHTML(xhr.responseText);
                                        var status = response.headers[CQ.utils.HTTP.HEADER_STATUS];
                                        if (status == 200) {
                                            CQ.mcm.cal.CampaignLens.refresh(id, teaser.get("pagePath"));
                                        }
                                    },
                                    "params":{
                                        "path": [teaser.get("pagePath")],
                                        "_charset_":"utf-8",
                                        "cmd":"deletePage",
                                        "force": true
                                    },
                                    "scope":this
                                });
                            }
                        }
                    ).setIcon(CQ.Ext.Msg.QUESTION);
                }
            },
            CQ.Dialog.OK,
            CQ.Dialog.CANCEL
        ],
        okText: CQ.I18n.getMessage("Save"),
        items: {
            xtype: "panel",
            items: [
                {
                    name: "onTime",
                    xtype: "datetime",
                    fieldLabel: CQ.I18n.getMessage("On Time")
                },{
                    name: "offTime",
                    xtype: "datetime",
                    fieldLabel: CQ.I18n.getMessage("Off Time")
                },{
                    name: "onTime@TypeHint",
                    value: "Date",
                    ignoreData: true,
                    xtype: "hidden"
                },{
                    name: "offTime@TypeHint",
                    value: "Date",
                    ignoreData: true,
                    xtype: "hidden"
                }
            ]
        }
    };
    dialog = CQ.WCM.getDialog(config);
    dialog.success = function(form, action) {
        CQ.mcm.cal.CampaignLens.refresh(id, teaser.get("pagePath"));
    };
    dialog.failure = function(form, action) {
        CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"), "Could not update on/off times.");
    };
    dialog.loadContent(teaser.get("path"));
    dialog.show();
};

CQ.Ext.reg("campaignlens", CQ.mcm.cal.CampaignLens);

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/

/**
 * @class CQ.mcm.GanttView
 * @extends CQ.Ext.Panel
 * The GanttView shows all campaigns for a specific brand in a Gantt Chart.
 * @constructor
 * Creates a new Campaigns Overview.
 * @param {Object} config The config object
 * @since 5.5
 */
CQ.mcm.GanttView = CQ.Ext.extend(CQ.Ext.Panel, {
    timelineStart: new Date().add(Date.DAY, -10).dateOnly(),
    timelineEnd: new Date().add(Date.DAY, 20).dateOnly(), // first day not visible
    columnColors: ["#fcfcfc", "white"],
    todayFillColor: "#faffee",
    eventFillColor: "#efefef", 
    eventStrokeColor: "#efefef", 
    eventLabelColor: "black",
    eventSelectedFillColor: "d3ea9a",
    eventSelectedLabelColor: "315c00",
    eventHoverFillColor: "dedede",
    columnBorderColor: "#eeeeee",
    mainHeaderColor: "#e1e1e1",
    subHeaderColor: "#eeeeee",
    subHeaderHighlightColor: "#ebf0de", // today
    headerBorderColor: "#c2c2c2",
    headerBorderTopColor: "#f9f9f9",
    headerBorderLeftColor: "#eeeeee",
    headerBorderRightColor: "#d0d0d0",
    blackFont: {
                    "fill": "black",
                    "font-size": "11px",
                    "font-weight": "normal",
                    "font-family": "tahoma,arial,helvetica,sans-serif"
                },
    blackFontCenter: {
                    "fill": "black",
                    "font-size": "11px",
                    "font-weight": "normal",
                    "font-family": "tahoma,arial,helvetica,sans-serif",
                    "text-align": "center"
                },
    blackFontCenterBold: {
        "fill": "black",
        "font-size": "11px",
        "font-weight": "bold",
        "font-family": "tahoma,arial,helvetica,sans-serif",
        "text-align": "center"
    },
    headerHeight: 46,
    mainHeaderInnerHeight: 22,
    subHeaderInnerHeight: 21,
    enableDoubleClick: false,

    // internal
    canvasWidth: 10,
    canvasHeight: 10,
    rowHeight: 30,
    doubleClickSpeed: 500,
    currentElement: null,
    currentSelection: null,
    currentRecord: null,

    constructor: function(config) {
        var that = this;
        var dateFormat = config.dateFormat || "Y-m-d";
        var timeFormat = config.timeFormat || "c";
        
        this.store = new CQ.Ext.data.JsonStore({
            root: 'events',
            idProperty: 'id',
            remoteSort: true,
    
            fields: [
                'id', 
                'label', 
                {name: 'startDate', convert: function(date) {
                    var tmp = Date.parseDate(date, dateFormat);
                    if(tmp != null)
                        return tmp.dateOnly();
                    else return null;
                }},
                {name: 'endDate', convert: function(date) {
                    var tmp = Date.parseDate(date, dateFormat);
                    if(tmp != null)
                        return tmp.dateOnly();
                    else return null;
                }},
                'touchpointType',
                'isDisplayOnTimes',
                'sling:resourceType',
                'propertiesDialogPath'
            ]
        });
        
        this.canvas = null;
        CQ.Util.applyDefaults(config,  {
                border: false,
                autoScroll: true,
                listeners: {
                    bodyresize: function(panel) {
                        that.panelSize = panel.body.getSize();
                        that.resizeCanvas();
                        that.doRender();
                    },
                    afterrender: function(panel) {
                        that.canvas = CQ.Raphael(panel.body.dom, 100, 100);
                    }
                }
            });
        
        config.timelineStart = config.timelineStart.dateOnly();
        config.timelineEnd = config.timelineEnd.dateOnly();

        CQ.mcm.GanttView.superclass.constructor.call(this, config);

        CQ.event.EventAdmin.registerEventHandler("com/day/mcm/gantt/CLICK", this.raiseClick, this);
        
    },
    initComponent: function() {
        CQ.mcm.GanttView.superclass.initComponent.call(this);
        
        this.addEvents(
            /**
             * @event eventclick
             * Fires when an event was clicked. If doubleclick is enabled, the single click is delayed by 500ms.
             * @param {Ext.data.Record} record the Record that belongs to this event.
             */
            'eventclick',
            /**
             * @event eventdblclick
             * Fires when an event was double clicked. Please enable double click by setting enableDoubleClick to true.
             * @param {Ext.data.Record} record the Record that belongs to this event.
             */
            'eventdblclick',
            /**
             * @event selectionchange
             * Fires when an event was selected. Works only if selectable is not false.
             * @param {CQ.mcm.GanttView} view
             * @param {Ext.data.Record} selection the Record that is currently selected. Null if nothing is selected
             */
            'selectionchange'
        );
    },
    
    setTimespan: function(startDate, endDate) {
        this.timelineStart = startDate.dateOnly();
        this.timelineEnd = endDate.dateOnly();
        this.doRender();
    },
    
    updateData: function(data) {
        this.store.loadData(data);
        this.resizeCanvas();
        this.doRender();
        this.currentSelection = null;
        this.fireEvent('selectionchange', this, null);
    },
    
    doRender: function() {
        this.canvas.clear();
        
        this.drawGrid();
        this.drawItems();
    },
    
    resizeCanvas: function() {
        var panelBody = this.body;
        var height = this.headerHeight + 15 + this.rowHeight * this.store.getCount() + 10; // the 10 pixel are just for a little gap below the last entry
        if (this.panelSize) {
            // if we do not need scrollbars, we would like to fill the space the scrollbar usually needs,
            // but this doesn't work, browsers will always start to show a scrollbar when making the window smaller
            // afterwards, so need to always accomodate for the scrollbar, to avoid it being shown if not needed.
            // So: Need to mangle the style to turn off the scroll bars
            if(height > this.panelSize.height-3) {
                this.canvasWidth = this.panelSize.width - 16;
                this.canvasHeight = height;
                if (panelBody) { 
                    panelBody.setStyle("overflow-x", "hidden");
                    panelBody.setStyle("overflow-y", "auto");
                }
            } else {
                this.canvasWidth = this.panelSize.width-1;
                this.canvasHeight = this.panelSize.height-3;
                // sadly shows an empty scrollbar on bottom
                if (panelBody) { 
                    panelBody.setStyle("overflow-x", "hidden");
                    panelBody.setStyle("overflow-y", "hidden");
                }   
            }
            this.canvas.setSize(this.canvasWidth, this.canvasHeight );
        }
    },
    
    getLastDayOfMonth: function(cal) {
        var daysToJumpOverEnd = 31 - cal.getDate(); // to or over
        var endCal = cal.add(Date.DAY, daysToJumpOverEnd);
        while (endCal.getMonth() != cal.getMonth()) {
            endCal = endCal.add(Date.DAY, -1);
        }
        return endCal.getDate();
    },
    
    drawGrid: function() {
        var days = Math.round(this.timelineStart.getElapsed(this.timelineEnd) / 86400000);
        var width = this.canvasWidth;
        if (width < 1) width = 1;
        var height = this.canvasHeight;
        if (height < 1) height = 1;
        
        var columnWidth = width / days;
        
        if(columnWidth >= 32) { // draw days
            
            for(var i=0; i < days; i++) {
                
                var currentColCal = this.timelineStart.add(Date.DAY, i);
                var currentColCurrentDay = currentColCal.getElapsed(new Date().dateOnly()) == 0;
                var currentColIsFirst = (i == 0);
                var currentColStartsMonth = (currentColCal.format("j") == 1);
                var daysLeftInMonth = this.getLastDayOfMonth(currentColCal) - (currentColCal.getDate()-1);
                                
                if(currentColIsFirst || currentColStartsMonth) {
                    this.canvas.rect(columnWidth * i, 1, daysLeftInMonth * columnWidth, this.mainHeaderInnerHeight + 0.5).attr({
                        fill: "url('" + CQ.HTTP.externalize("/libs/cq/ui/widgets/themes/default/ext/grid/grid3-hrow2.gif") + "')",// this.mainHeaderColor,
                        stroke: ""
                    });
                    // draw month name only if length available is at least 80px.
                    var daysOfMonthToDraw = Math.min(daysLeftInMonth, days - i);
                    if (daysOfMonthToDraw * columnWidth >= 80) {
                        var middle = i + (daysOfMonthToDraw/2.0);
                        this.canvas.text(columnWidth * (middle), 12, currentColCal.format("F")).attr(this.blackFontCenterBold);
                    }
                }
                if (currentColStartsMonth) {
                    // draw vertical line
                    this.canvas.path("M" + (columnWidth * i ) + ", " + (0 + 1) 
                        + " L " + (columnWidth * i ) + "," + (this.mainHeaderInnerHeight + 1 )).attr({
                        fill: "none",
                        stroke: this.headerBorderRightColor,
                        "stroke-width": "1px"
                    });
                    this.canvas.path("M" + (columnWidth * i + 1) + ", " + (0 + 1) 
                        + " L " + (columnWidth * i + 1) + "," + (this.mainHeaderInnerHeight + 1 )).attr({
                        fill: "none",
                        stroke: this.headerBorderLeftColor,
                        "stroke-width": "1px"
                    });
                }
                                
                var subHeaderFill = currentColCurrentDay ? this.subHeaderHighlightColor : this.subHeaderColor;
                this.canvas.rect(columnWidth * i, this.mainHeaderInnerHeight + 1, columnWidth, this.subHeaderInnerHeight + 0.5+1).attr({
                    fill: subHeaderFill,
                    stroke: ""
                });
                
                // subheader separator line
                this.canvas.path("M" + (columnWidth * i + 0) + ", " + (this.mainHeaderInnerHeight + 1) 
                    + " L " + (columnWidth * i + 0) + "," + (this.mainHeaderInnerHeight + 1 + this.subHeaderInnerHeight + 1)).attr({
                    fill: "none",
                    stroke: this.headerBorderColor,
                    "stroke-width": "1px"
                });
                
                var subheaderFormat = "j";
                if (columnWidth >= 80) {
                    subheaderFormat = "l, j";
                }
                this.canvas.text(columnWidth * (i + 0.5), this.headerHeight - 11, 
                    this.timelineStart.add(Date.DAY, i).format(subheaderFormat)).attr(this.blackFontCenter);
                
                
                // main canvas coloring
                var fillColor = (currentColCurrentDay ? this.todayFillColor: this.columnColors[i % 2] );
                var mainFillHeight = height-this.headerHeight;
                if (mainFillHeight < 1) {
                    mainFillHeight = 1;
                }
                this.canvas.rect(columnWidth * i, this.headerHeight, columnWidth, mainFillHeight).attr({
                    fill: fillColor,
                    stroke: ""
                });                
                this.canvas.path("M" + columnWidth * i + "," + this.headerHeight + " L " + columnWidth * i + "," + height).attr({
                    fill: "none",
                    stroke: this.columnBorderColor
                });
                
            }
        }else { // draw weeks
            var startOfWeek = 
                Number(CQ.I18n.getMessage("0", null, "Start day for week view in calendar (0=Sunday, 1=Monday, etc.)"));
            var weekColumnWidth = width * 7 / days;
            var week = 0;
            
            for(var i=0; i < days; i++) {
                var currentColCal = this.timelineStart.add(Date.DAY, i);
                var currentColCurrentDay = currentColCal.getElapsed(new Date().dateOnly()) == 0;
                var currentColIsFirst = (i == 0);
                var currentColWeekday = parseInt(currentColCal.format("w"));
                var currentColStartsWeek = (""+currentColWeekday == startOfWeek);
                if (startOfWeek) {
                    if (currentColWeekday < startOfWeek) {
                        deltaToLastWeekDay = startOfWeek - currentColWeekday;
                    } else {
                        deltaToLastWeekDay = 6 + startOfWeek - currentColWeekday;
                    }                    
                } else {
                    var deltaToLastWeekDay = 6  - currentColWeekday;
                }
                var lastWeekDay = currentColCal.add(Date.DAY, deltaToLastWeekDay);
                
                if (currentColStartsWeek) week++;
            
                var currentColStartsMonth = (currentColCal.format("j") == 1);
                var daysLeftInMonth = this.getLastDayOfMonth(currentColCal) - (currentColCal.getDate()-1);
                           
                // main header (months)
                if(currentColIsFirst || currentColStartsMonth) {
                    this.canvas.rect(columnWidth * i, 1, daysLeftInMonth * columnWidth, this.mainHeaderInnerHeight + 0.5).attr({
                        fill: "url('" + CQ.HTTP.externalize("/libs/cq/ui/widgets/themes/default/ext/grid/grid3-hrow2.gif") + "')",// this.mainHeaderColor,
                        stroke: ""
                    });
                    // draw month name only if length available is at least 120px.
                    var daysOfMonthToDraw = Math.min(daysLeftInMonth, days - i);
                    
                    if (daysOfMonthToDraw * columnWidth >= 120) {
                        var middle = i + (daysOfMonthToDraw/2.0);
                        this.canvas.text(columnWidth * (middle), 12, currentColCal.format("F Y")).attr(this.blackFontCenterBold);
                    }
                }
                if (currentColStartsMonth) {
                    // draw vertical line
                    this.canvas.path("M" + (columnWidth * i + 0) + ", " + (0 + 1) 
                        + " L " + (columnWidth * i +0) + "," + (this.mainHeaderInnerHeight + 1 )).attr({
                        fill: "none",
                        stroke: this.headerBorderRightColor,
                        "stroke-width": "1px"
                    });
                    this.canvas.path("M" + (columnWidth * i + 1) + ", " + (0 + 1) 
                        + " L " + (columnWidth * i + 1) + "," + (this.mainHeaderInnerHeight + 1 )).attr({
                        fill: "none",
                        stroke: this.headerBorderLeftColor,
                        "stroke-width": "1px"
                    });
                }
    
                if (currentColStartsWeek || currentColIsFirst) {
                    
                    // sub header
                    this.canvas.rect(columnWidth * i , this.mainHeaderInnerHeight + 1, columnWidth*(deltaToLastWeekDay+1), this.subHeaderInnerHeight + 0.5+1).attr({
                        fill: this.subHeaderColor,
                        stroke: ""
                    });
                    
                    // subheader separator line
                    this.canvas.path("M" + (columnWidth * i + 0) + ", " + (this.mainHeaderInnerHeight + 1) 
                        + " L " + (columnWidth * i + 0) + "," + (this.mainHeaderInnerHeight + 1 + this.subHeaderInnerHeight + 1)).attr({
                        fill: "none",
                        stroke: this.headerBorderColor,
                        "stroke-width": "1px"
                    });
                    
                    if (deltaToLastWeekDay * columnWidth >= 45) {
                        var formatDate = currentColCal;
                        if (startOfWeek == 0) {
                            formatDate = currentColCal.add(Date.DAY, 1); // be sure to have a monday or tuesday, if week starts on sunday,
                                                                         // the format for CW starts on monday with new week (see iso why we need this).
                        }
                        this.canvas.text(columnWidth * (i + (deltaToLastWeekDay+1)/2), this.headerHeight - 13, 
                            formatDate.format("C\\W W")).attr(this.blackFontCenter);
                    }
                        
                    // main canvas coloring
                    var fillColor = this.columnColors[week % 2];
                    var mainFillHeight = height-this.headerHeight;
                    if (mainFillHeight < 1) mainFillHeight = 1;
                    this.canvas.rect(columnWidth * i, this.headerHeight, columnWidth*(deltaToLastWeekDay+1), mainFillHeight).attr({
                        fill: fillColor,
                        stroke: ""
                    });                
                    this.canvas.path("M" + columnWidth * i + "," + this.headerHeight + " L " + columnWidth * i + "," + height).attr({
                        fill: "none",
                        stroke: this.columnBorderColor
                    });
                }
                
                // subheader day marker line
                this.canvas.path("M" + (columnWidth * i + 0) + ", " + (this.mainHeaderInnerHeight + 1+16) 
                    + " L " + (columnWidth * i + 0) + "," + (this.mainHeaderInnerHeight + 1 + this.subHeaderInnerHeight + 1)).attr({
                    fill: "none",
                    stroke: this.headerBorderColor,
                    "stroke-width": "1px"
                });
                if (currentColCurrentDay) {
                    var mainFillHeight = height-this.headerHeight;
                    if (mainFillHeight < 1) mainFillHeight = 1;
                    this.canvas.rect(columnWidth * i, this.headerHeight, columnWidth, mainFillHeight).attr({
                        fill: this.todayFillColor,
                        stroke: ""
                    });   
                }
                
                
            }
            
            
        }
        this.canvas.path("M0,0 L" + width + ",0").attr({
            fill: "none",
            stroke: this.headerBorderTopColor,
            "stroke-width": "1px"
        });
        // separation lines between header parts:        
        this.canvas.path("M0," + (this.mainHeaderInnerHeight + 1 + this.subHeaderInnerHeight + 1) 
            + " L" + width + "," + (this.mainHeaderInnerHeight + 1 + this.subHeaderInnerHeight + 1)).attr({
            fill: "none",
            stroke: this.headerBorderColor,
            "stroke-width": "1px"
        });
    },
    
    dataStoreFilter: function(record, id) {
        if (! this.recordHasStartEnd(record)) {
            return true; // records without start or end shown all the time
        }
        var timelineStartInSec = this.timelineStart.format("U");
        var timelineEndInSec = this.timelineEnd.format("U");
        var startInSec = record.data.startDate.format("U");
        var endInSec = record.data.endDate.format("U");
        return (timelineStartInSec <= startInSec && startInSec < timelineEndInSec) ||
                (timelineStartInSec <= endInSec && endInSec < timelineEndInSec) ||
                (startInSec < timelineStartInSec && timelineEndInSec <= endInSec);
    },
    
    drawItems: function() {
        var that = this;
        var days = Math.floor(this.timelineStart.getElapsed(this.timelineEnd) / 86400000);
        var width = this.canvasWidth;
        var height = this.canvasHeight;
        var columnWidth = width / days;
        var maxEvents = Math.floor(height / this.rowHeight) - 1;
        
        this.store.filterBy(this.dataStoreFilter, this);
        var row = 0;
        var timelineStartInSec = this.timelineStart.format("U");
        this.store.each(function(record) {
                var set = this.canvas.set();
                var startDate = null;
                var endDate = null;
                startDate = record.data.startDate;
                endDate = record.data.endDate;
                if(startDate == null)
                    startDate = this.timelineStart.add(Date.DAY, -10);
                if(endDate == null)
                    endDate  = this.timelineEnd.add(Date.DAY, 10);
                
                var startInSec = startDate.format("U");
                var startDay = Math.round((startInSec - timelineStartInSec) / 86400);
                var lengthInDays = Math.round(startDate.getElapsed(endDate) / 86400000) + 1; // plus one to include the endDate => if start and end are the same, it should be one full day
                var recordRectWidth = columnWidth * lengthInDays - 2;
                if (recordRectWidth < 1) recordRectWidth = 1;
                var recordRectHeight = this.rowHeight - 6;
                if (recordRectHeight < 1) recordRectHeight = 1;
                var recordRect = this.canvas.rect(columnWidth * startDay + 1, this.rowHeight * row + 3 + this.headerHeight + 12, recordRectWidth, recordRectHeight, 8).attr({
                    fill: this.eventFillColor,
                    stroke: this.eventStrokeColor,
                    cursor: "pointer",
                    "stroke-width": "0px"
                });
                
                
                
                set.push(recordRect);
                
                set.push(
                    this.canvas.text(Math.max(columnWidth * startDay + 11, 7), this.rowHeight * (row + 0.5) + this.headerHeight + 12, record.data.label).attr(CQ.Util.applyDefaults({
                        fill: this.eventLabelColor,
                        cursor: "pointer",
                        "text-anchor": "start"
                    }, this.blackFont))
                );
                
                var current = {element: set, record: record};
                set.hover(function(evt) {
                    var currentLoc = current;
                    that.hover(evt, currentLoc.element, currentLoc.record);
                }, function(evt) {
                    var currentLoc = current;
                    that.unhover(evt, currentLoc.element, currentLoc.record);
                });
                set.click(function(evt) {
                    var currentLoc = current;
                    that.click(evt, currentLoc.element, currentLoc.record);
                });
                set.dblclick(function(evt) {
                    var currentLoc = current;
                    that.dblclick(evt, currentLoc.element, currentLoc.record);
                });
                
                row++;
        }, this);

        return;

    },
    
    raiseClick: function() {
        if(this.selectable !== false)
            this.selectEvent(this.currentElement, this.currentRecord);
        this.fireEvent('eventclick', this.currentRecord);
    },
    
    selectEvent: function(element, record) {
        if(this.currentSelection != null && this.currentSelection.record.id == record.id) {
            // ignore, no changes
        } else {
            if(this.currentSelection != null) {
                this.currentSelection.element.items[0].attr("fill", this.eventFillColor);
                this.currentSelection.element.items[1].attr("font-weight", "normal");
                this.currentSelection.element.items[1].attr("fill", this.eventLabelColor);
            }

            element.items[0].attr("fill", "#" + this.eventSelectedFillColor);
            element.items[1].attr("font-weight", "bold");
            element.items[1].attr("fill", "#" + this.eventSelectedLabelColor);
            this.currentSelection = {
                element: element,
                record: record
            };
            this.fireEvent('selectionchange', this, record);
        }
    },
    
    hover: function(evt, element, record) {
        if(this.currentSelection == null || this.currentSelection.element != element)
            element.items[0].attr("fill", "#" + this.eventHoverFillColor);
    },
    
    unhover: function(evt, element, record) {
        if(this.currentSelection == null || this.currentSelection.element != element)
            element.items[0].attr("fill", this.eventFillColor);
    },
    
    click: function(evt, element, record) {
        if(this.selectable !== false)
            this.selectEvent(element, record);
        this.fireEvent('eventclick', record);
    },
    
    dblclick: function(evt, element, record) {
        this.fireEvent('eventdblclick', record);
    },
    
    recordHasStartEnd: function(record) {
        if (record.data.startDate == null
            || record.data.endDate == null) {
            return false;
        }
        return true;
    }
});

CQ.Ext.reg("mcmganttview", CQ.mcm.GanttView);

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/

/**
 * @class CQ.mcm.TeaserBrowseDialog
 * @extends CQ.Dialog
 * The TeaserBrowseDialog lets the user browse the repository in order to
 * select a teaser (touchpoint means the same thing and is the newer and more
 * general term).
 * @constructor
 * Creates a new TeaserBrowseDialog.
 * @param {Object} config The config object
 */
CQ.mcm.TeaserBrowseDialog = CQ.Ext.extend(CQ.Dialog, {

    /**
     * The browse dialog's tree panel.
     * @private
     * @type CQ.Ext.tree.TreePanel
     */
    treePanel: null,
    
    /**
     * The path to a node if one is currently selected.
     */
    selectedNode: null,
    

    initComponent: function(){
        CQ.mcm.TeaserBrowseDialog.superclass.initComponent.call(this);
        this.okButton = this.buttons[0];
        this.okButton.disable();
    },

    /**
     * Returns the path of the selected tree node (or an empty string if no
     * tree node has been selected yet).
     * @return {String} The path
     */
    getSelectedPath: function() {
        if (this.selectedNode) {
            return this.selectedNode.attributes.path;
        } else {
            return null;
        }
    },

    constructor: function(config){
        if (config) {
            // ok
        } else {
            config = {};
        }

        var treeRootConfig = CQ.Util.applyDefaults(config.treeRoot, {
            "name": "content",
            "text": CQ.I18n.getMessage("Site"),
            "draggable": false,
            "singleClickExpand": true,
            "expanded":true
        });

        var treeLoaderConfig = CQ.Util.applyDefaults(config.treeLoader, {
            // teaser tree loader config
            dataUrl: "/libs/mcm/teasers.json?",
            requestMethod: "GET",
            baseAttrs: {
                singleClickExpand: true
            },
            baseParams: {
                touchpointTypes: config.touchpointTypes
            }
        });

        var that = this;
        this.treePanel = new CQ.Ext.tree.TreePanel({
            "region":"center",
            "lines": CQ.themes.BrowseDialog.TREE_LINES,
            "bodyBorder": CQ.themes.BrowseDialog.TREE_BORDER,
            "bodyStyle": CQ.themes.BrowseDialog.TREE_STYLE,
            "height": "100%",
            "width": 300,
            "autoScroll": true,
            "containerScroll": true,
            "root": new CQ.Ext.tree.AsyncTreeNode(treeRootConfig),
            "loader": new CQ.Ext.tree.TreeLoader(treeLoaderConfig),
            "defaults": {
                "draggable": false
            }
        });
        this.treePanel.getSelectionModel().on("selectionchange", function(theSelModel, theNode) {
            that.selectionChangeHandler(theSelModel, theNode);
        });

        var width = CQ.themes.BrowseDialog.WIDTH;
        var items = this.treePanel;

        CQ.Util.applyDefaults(config, {
            "title": CQ.I18n.getMessage("Select Touchpoint"),
            "closable": true,
            "width": width,
            "height": CQ.themes.BrowseDialog.HEIGHT,
            "minWidth": CQ.themes.BrowseDialog.MIN_WIDTH,
            "minHeight": CQ.themes.BrowseDialog.MIN_HEIGHT,
            "resizable": CQ.themes.BrowseDialog.RESIZABLE,
            "resizeHandles": CQ.themes.BrowseDialog.RESIZE_HANDLES,
            "autoHeight": false,
            "autoWidth": false,
            "cls":"cq-browsedialog",
            "ok": function() { this.hide(); },
            "buttons": CQ.Dialog.OKCANCEL,
            "items": items
        });
        CQ.mcm.TeaserBrowseDialog.superclass.constructor.call(this, config);
    },
    
    selectionChangeHandler: function(theSelModel, theNode) {
        if (theNode) {
            this.selectedNode = theNode;
            if (theNode.isLeaf()) {
                this.okButton.enable();
            } else {
                this.okButton.disable();
            }
        } else {
            this.selectedNode = null;
            this.okButton.disable();
        }

    }

});

CQ.Ext.reg('teaserbrowsedialog', CQ.mcm.TeaserBrowseDialog);

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
 **************************************************************************/

/**
 * @class CQ.mcm.CampaignsPanel
 * @extends CQ.Ext.Panel
 * The CampaignsPanel is the panel that contains the BrandsView, the CampaignsView, and the CampaignPlanner in a card layout.
 * @constructor
 * Creates a new Campaigns Overview.
 * @param {Object} config The config object
 * @since 5.5
 */
CQ.mcm.CampaignsPanel = CQ.Ext.extend(CQ.Ext.Panel, {

    constructor: function(config) {
        var that = this;
        this.selectedItem = null;
        this.dontRefreshIframeOnEvent = false;
        

        CQ.Util.applyDefaults(config,  {
            "xtype": "panel",
            "layout": "border",
            "border": false,
            cls: "cq-mcm-campaigns",
            "items": [that.outerCardPanel = new CQ.Ext.Panel({
                "region": "center",
                "margins": "5 5 5 5",
                layout: "card",
                "border": true,
                activeItem: 0,
                items: [{
                    xtype: "mcmbrandsview"
                },{
                    xtype: "mcmcampaignsview"
                },{
                    "xtype": "mcmcampaignplanner"
                },{
                    xtype: "iframepanel",
                    id: that.getId() + "-iframe",
                    tbar:[
                       {
                           iconCls: 'x-tbar-loading',
                           handler: function() {that.handleRefresh();}
                       },
                       {
                         text:'New&hellip;',
                         handler:function() {
                            that.handleNew();
                         }
                       },
                       {
                         id: that.getId() + "-iframepropsbutton",
                         text:'Properties&hellip;',
                         handler:function() {
                            that.handleProperties();
                         }
                       },
                       '-',
                       {
                         id: that.getId() + "-iframedelbutton",
                         text:'Delete',
                         handler:function() {
                            that.handleDelete();
                         }
                    }],
                    border: false,
                    listeners: {
                        "iframeload": function(iframePanel, iframeElem, evt) {
                            var contentPath = iframeElem.contentWindow.location.pathname;
                            if (that.selectedItem) {
                                if (that.selectedItem.path + ".html" == contentPath) {
                                    iframePanel.setButtonsEnabled(true);
                                } else {
                                    iframePanel.setButtonsEnabled(false);
                                }
                            }
                        }
                    },
                    setButtonsEnabled: function(enabled) {
                        var propsButton = this.getTopToolbar().get(that.getId() + "-iframepropsbutton");
                        var delButton = this.getTopToolbar().get(that.getId() + "-iframedelbutton");
                        propsButton.setDisabled(!enabled);
                        delButton.setDisabled(!enabled);
                    }
                }]
                
            })]
        });

        CQ.mcm.CampaignsPanel.superclass.constructor.call(this, config);
        
        CQ.event.EventAdmin.registerEventHandler("com/day/mcm/SELECTIONCHANGE", this.selectionChange, this);
    },
    
    selectionChange: function(event) {
        this.selectedItem = event.properties;
        if(event.properties.resourceType == "mcmadmin/deck") {
            this.outerCardPanel.layout.setActiveItem(0);
        } else if(event.properties.resourceType == "mcm/components/brandpage") {
            this.outerCardPanel.layout.setActiveItem(1);
        } else if(event.properties.resourceType == "cq/personalization/components/campaignpage") {
            this.outerCardPanel.layout.setActiveItem(2);
        } else if(event.properties.resourceType == "collab/twitter/components/account") {
            // TODO here not plugin-compatible. need to use sth else than resourceType. 
            // TODO tree should give more properties
            var iframePanel = this.findByType("iframepanel")[0];
            iframePanel.setUrl("about:blank");
            iframePanel.setUrl(CQ.HTTP.externalize(event.properties.path + ".html"));
            this.outerCardPanel.layout.setActiveItem(3);
        }

    },
    
    handleRefresh: function() {
        var iframe = this.findById(this.getId() + "-iframe");
        if (iframe && ! this.dontRefreshIframeOnEvent) {
            if (iframe.getContentWin()) {
                iframe.getContentWin().location.reload();
            }
        }
        this.dontRefreshIframeOnEvent = false;
        
        if (this.selectedItem) {
            CQ.event.EventAdmin.sendEvent( new CQ.event.Event( "com/day/mcm/REFRESH", {
                path: this.selectedItem.path
            }) );
        }
    },
    
    handleNew: function() {
        // this is creating a new page underneath of the current Item's parent
        var that = this;
        if (this.selectedItem) {
            var parentPath = this.selectedItem.path.substring(0, this.selectedItem.path.lastIndexOf("/"));
            
            var dialog = CQ.wcm.Page.getCreatePageDialog(parentPath);
            dialog.responseScope = this;                               
            dialog.success = function(form, xhr) {
                var response = CQ.HTTP.buildPostResponseFromHTML(xhr.response);
                var path = response.headers[CQ.utils.HTTP.HEADER_PATH];
    
                CQ.HTTP.post(
                    path + "/jcr:content",
                    function(options, success, response) {
                        if (success) {
                            that.handleRefresh();
                            that.dontRefreshIframeOnEvent = true;
                            CQ.event.EventAdmin.sendEvent( new CQ.event.Event( "com/day/mcm/REQSELECTIONCHANGE", {
                                path: path
                            }) );                           
                        } else {
                            CQ.Ext.Msg.alert(
                                CQ.I18n.getMessage("Error"),
                                CQ.I18n.getMessage("Could not create new page - server command failed.")
                            );
                        }
                    },
                    {
                    },
                    this
                );
            };
            dialog.failure = function() {
                CQ.Ext.Msg.alert(
                    CQ.I18n.getMessage("Error"),
                    CQ.I18n.getMessage("Could not create page.")
                );
            };
            dialog.show();
        }
    },
    
    handleDelete: function() {
        var that = this;
        if(this.selectedItem) {
            var data = {
                ":operation": "delete",
                ":applyTo": [ this.selectedItem.path.substring(this.selectedItem.path.lastIndexOf("/") + 1, 
                        this.selectedItem.path.length) ]
            };
                
            CQ.HTTP.post(this.selectedItem.path.substring(0, this.selectedItem.path.lastIndexOf("/")), function() {
                CQ.event.EventAdmin.sendEvent( new CQ.event.Event( "com/day/mcm/REQSELECTIONCHANGE", {
                    path: this.selectedItem.path.substring(0, this.selectedItem.path.lastIndexOf("/"))
                }) );
                that.dontRefreshIframeOnEvent = true;
                that.handleRefresh();
            }, data, this);
        }
    },
    
    handleProperties: function() {
        var that = this;
        var refresher = function() { that.handleRefresh(); };
        if (that.selectedItem) {
            var contentPath = this.selectedItem.path + "/jcr:content";
            // TODO here not plugin-compati. need to get dialog path from server.
            if(that.selectedItem.resourceType == "collab/twitter/components/account") {
                // TODO think about how to include JS from the plugins - here for example the connect button
                // is needed
                CQ.mcm.Util.openDialog(contentPath, "/libs/collab/twitter/components/account/dialog.infinity.json", false, refresher,
                    function() {CQ.Ext.Msg.alert("Error", "Nothing done, please connect to an account.");});
            }
        }
    
    }

});

CQ.Ext.reg("mcmcampaignspanel", CQ.mcm.CampaignsPanel);

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
 * @class CQ.form.rte.plugins.PersonalizationPlugin
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
CQ.form.rte.plugins.PersonalizationPlugin= CQ.Ext.extend(CQ.form.rte.plugins.Plugin, {

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
    CQ_DEFAULT_PERSONALIZATION_URL:"/libs/mcm/components/personalization/cqDefaultPersonalization.infinity.json",
    constructor: function(editorKernel) {
        CQ.form.rte.plugins.PersonalizationPlugin.superclass.constructor.call(this, editorKernel);
    },

    getFeatures: function() {
        return [ "variables" ];
    },

    getVariables: function() {
    	var opts = {};
    	try {
    		var et = document.getElementsByName("cfgpath");
    		var cfgPath = "";
    		if(et.length > 0){
    			cfgPath = et[0].value;
    		}
    		var personalizationFilter = document.getElementById("personalizationFilter");
    		var url;
    		if(cfgPath)
    			url =  "/_jcr_content.emailservice.json?operation=getEmailTools&cfgpath=" + cfgPath + (personalizationFilter ? "&" + personalizationFilter.value : "");
    		else
    			url = this.CQ_DEFAULT_PERSONALIZATION_URL;
    		var data = CQ.HTTP.eval(url);   
    		var sortOpts = [];
    		for(var item in data){
    			if(!data.hasOwnProperty(item))
    			{
    				continue;
    			}
	    		CQ.Log.error("message ---" + item);
	    		var t1 = data[item].text;
	    		var v1 = data[item].value;
	    		if(t1 && v1)
	    		{
	    			var name = t1.replace(/\s/g,'');
	    			sortOpts.push({name:name,value:v1,text:t1});
	    		}
    		}
    		sortOpts.sort(function(l1,l2){
    			if(l1.name < l2.name)
    				return -1;
    			else if(l1.name == l2.name)
    				return 0;
    			else 
    				return 1;
    		});
    		for(var i=0; i < sortOpts.length; i++){
    			opts[sortOpts[i].name] = {text:sortOpts[i].text,value:sortOpts[i].value};
    		}

    		return opts;
    	} catch (e) {
    		CQ.Log.error("CQ.form.rte.plugins.PersonalizationPlugin#getVariablesfailed: " + e.message);
    	}
    	return opts;
    },
    
    initializeUI: function(tbGenerator) {
        var plg = CQ.form.rte.plugins;
        var ui = CQ.form.rte.ui;
        if (this.isFeatureEnabled("personalizationplugin")) {
            this.variablesUI = new ui.TbVariableSelector("personalizationplugin", this, null, this.getVariables());
            tbGenerator.addElement("personalizationplugin", plg.Plugin.SORT_STYLES, this.variablesUI, 10);
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
            case "personalizationplugin_insert":
                cmd = "inserthtml";
                value = this.variablesUI.getSelectedVariable();
                
                break;
        }
        if (cmd && value) {
            var vt = value;
            //var html = "<span class=\"cq-variable cq-variable-code cq-variable-vars-"+value+"\" title=\""+vt+"\">"+vt+"</span>&nbsp;";
            this.editorKernel.relayCmd(cmd, vt);
        }
    }
});

// register plugin
CQ.form.rte.plugins.PluginRegistry.register("personalizationplugin", CQ.form.rte.plugins.PersonalizationPlugin);
