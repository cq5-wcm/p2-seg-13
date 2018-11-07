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
 * @class CQ.form.ExtendedSmartImage
 * @extends CQ.form.SmartFile
 * <p>The SmartImage is an intelligent image uploader. It provides tools to process an
 * uploaded image, for example a tool to define image maps and an image cropper.</p>
 * <p>Note that the component is mainly designed for use on a separate dialog tab. You may
 * use the component inside a {@link CQ.Ext.layout.FormLayout} optionally if you provide
 * a suitable {@link #height} setting.</p>
 * <p>Acknowledgements:<br>
 * Flash is a registered trademark of Adobe Systems, Inc. (http://www.adobe.com).<br>
 * SWFUpload is an open source library (http://www.swfupload.org).</p>
 * @constructor
 * Creates a new SmartImage.
 * @param {Object} config The config object
 */
CQ.form.ExtendedSmartImage = CQ.Ext.extend(CQ.form.SmartFile, {

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
     * @type CQ.form.ExtendedSmartImage.Image
     */
    originalImage: null,

    /**
     * The processed image
     * @private
     * @type CQ.form.ExtendedSmartImage.Image
     */
    processedImage: null,

    /**
     * The original image if a file reference is being used (will overlay originalImage if
     * present)
     * @private
     * @type CQ.form.ExtendedSmartImage.Image
     */
    originalRefImage: null,

    /**
     * The processed image if a file reference is being used (will overlay processedImage
     * if defined
     * @private
     * @type CQ.form.ExtendedSmartImage.Image
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
     * CQ.form.ExtendedSmartImage instance.</p>
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
     *   <li><code>this</code> : CQ.form.ExtendedSmartImage</li>
     * </ul>
     * <p>Returns:</p>
     * <ul>
     *   <li><code>String</code> : The URL or null if the original URL should be used</li>
     * </ul>
     * @see CQ.form.ExtendedSmartImage#defaultPathProvider
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
            "pathProvider": CQ.form.ExtendedSmartImage.defaultPathProvider,
            "hideMainToolbar": false
        };

        // Create tool defs
        this.imageToolDefs = [ ];
        if (config.mapParameter) {
            this.imageToolDefs.push(new CQ.form.ExtendedImageMap(config.mapParameter));
            delete config.mapParameter;
        }
        if (config.cropParameter) {
            this.imageToolDefs.push(new CQ.form.ExtendedImageCrop(config.cropParameter));
            delete config.cropParameter;
        }
        if (config.rotateParameter) {
            this.imageToolDefs.push(
                    new CQ.form.ExtendedSmartImage.ExtendedTool.Rotate(config.rotateParameter));
            delete config.rotateParameter;
        }

        CQ.Util.applyDefaults(config, defaults);
        CQ.form.ExtendedSmartImage.superclass.constructor.call(this, config);

        this.addEvents(

            /**
             * @event beforeloadimage
             * Fires before image data gets loaded. Note that if different versions of
             * the same image (original, processed) are loaded, this only gets fired
             * once.
             * @param {CQ.form.ExtendedSmartImage} imageComponent The image component
             * @since 5.4
             */
            "beforeloadimage",

            /**
             * @event loadimage
             * Fires after image data has been loaded successfully. Note that if different
             * versions of the same image (original, processed) are loaded, this only gets
             * fired once, after all versions have been loaded successfully.
             * @param {CQ.form.ExtendedSmartImage} imageComponent The image component
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
             * @param {CQ.form.ExtendedSmartImage} imageComponent The image component
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

        CQ.form.ExtendedSmartImage.superclass.initComponent.call(this);

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
        this.imagePanel = new CQ.form.ExtendedSmartImage.ImagePanel({
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
        CQ.form.ExtendedSmartImage.superclass.onRender.call(this, ct, pos);
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
                fieldEditLock = false; // currently we cancel inheritance for all props that are managed by ExtendedSmartImage
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
            this.originalRefImage = new CQ.form.ExtendedSmartImage.Image({
                "dataPath": this.referencedFileInfo.dataPath,
                "url": this.referencedFileInfo.url,
                "fallbackUrl": this.referencedFileInfo.fallbackUrl
            });
            this.notifyImageLoad(this.originalRefImage);
            processedImageConfig =
                    this.createProcessedImageConfig(this.referencedFileInfo.dataPath);
            if (processedImageConfig) {
                this.processedRefImage =
                        new CQ.form.ExtendedSmartImage.Image(processedImageConfig);
                this.notifyImageLoad(this.processedRefImage);
            }
            this.originalRefImage.load();
            if (processedImageConfig) {
                this.processedRefImage.load();
            }
        }
        if (this.fileInfo) {
            this.originalImage = new CQ.form.ExtendedSmartImage.Image({
                "dataPath": this.fileInfo.dataPath,
                "url": this.fileInfo.url
            });
            this.notifyImageLoad(this.originalImage);
            processedImageConfig = this.createProcessedImageConfig(path);
            if (processedImageConfig) {
                this.processedImage = new CQ.form.ExtendedSmartImage.Image(
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
     * Method that is called to inform the ExtendedSmartImage component about a new image that is
     * about to be loaded.
     * @param {CQ.form.ExtendedSmartImage.Image} img The image that is about to be loaded
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
        CQ.form.ExtendedSmartImage.superclass.syncFormElements.call(this);
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
     * @return {CQ.form.ExtendedSmartImage.ImagePanel} The image panel used for displaying/editing
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
        this.originalImage = new CQ.form.ExtendedSmartImage.Image(this.fileInfo);
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
        CQ.form.ExtendedSmartImage.superclass.reset.call(this);
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
     * @return {CQ.form.ExtendedSmartImage.Image} The image object
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
            this.originalRefImage = new CQ.form.ExtendedSmartImage.Image(this.referencedFileInfo);
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
  * {@link CQ.form.ExtendedSmartImage#pathProvider pathProvider}. Assembles and returns the path of
  * the image.
  * @static
  * @param {String} path The content path
  * @param {String} requestSuffix The configured request suffix (replaces extension)
  * @param {String} extension The original extension
  * @param {CQ.data.SlingRecord} record The data record
  * @return {String} The URL
  */
CQ.form.ExtendedSmartImage.defaultPathProvider = function(path, requestSuffix, extension, record) {
    if (!requestSuffix) {
        return null;
    }
    return CQ.HTTP.externalize(path + requestSuffix);
};

// register xtype
CQ.Ext.reg('extendedsmartimage', CQ.form.ExtendedSmartImage);
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
 * @class CQ.form.ExtendedSmartImage.Image
 * @private
 * The SmartImage.Image defines an image that may be used for
 * displaying and/or processing using the {@link CQ.form.ExtendedSmartImage.ImagePanel}
 * implementation.
 */
CQ.form.ExtendedSmartImage.Image = CQ.Ext.extend(CQ.Ext.emptyFn, {

    /**
     * @cfg {String} dataPath
     * The data path of the image in the repository (without webapp context prefix)
     */
    dataPath: null,

    /**
     * @cfg {String] url
     * The URL for accessing/loading the image (including webapp context prefix)
     */
    url: null,

    /**
     * The image (DOM object).
     * @type HTMLElement
     * @private
     */
    image: null,

    /**
     * Width of the image (available after loading has completely finished)
     * @type Number
     * @private
     */
    width: null,

    /**
     * Height of the image (available after loading has completely finished)
     * @type Number
     * @private
     */
    height: null,

    /**
     * Flag if the image has been completely loaded
     * @type Boolean
     * @private
     */
    isLoaded: false,

    /**
     * @cfg {Function} loadHandler
     * Handler to be called once the image has been loaded completely
     */
    loadHandler: null,

    /**
     * Array of tool specific load handler definitions; properties: fn (the function to
     * be executed); runOnce (True if the handler should only be executed on the next
     * loading operation)
     * @private
     * @type Object[]
     */
    toolLoadHandlers: null,

    constructor: function(config) {
        this.url = config.url;
        this.dataPath = config.dataPath;
        this.fallbackUrl = config.fallbackUrl;
        this.isLoaded = false;
        this.loadHandler = config.loadHandler;
        this.toolLoadHandlers = [ ];
    },

    /**
     * <p>Starts loading the image.</p>
     * <p>Loading will be executed asynchroneously. You may specify a handler in the
     * component's configuration that will be executed once loading has been completed.</p>
     */
    load: function() {
        this.image = new Image();
        CQ.Ext.EventManager.on(this.image, "load", function() {
            this.width = this.image.width;
            this.height = this.image.height;
            this.isLoaded = true;
            if (this.loadHandler) {
                this.loadHandler(this);
            }
            var handlerCnt = this.toolLoadHandlers.length;
            for (var handlerIndex = handlerCnt - 1; handlerIndex >= 0; handlerIndex--) {
                var toolHandler = this.toolLoadHandlers[handlerIndex];
                toolHandler.fn(this);
                if (toolHandler.runOnce) {
                    this.toolLoadHandlers.splice(handlerIndex, 1);
                }
            }
        }, this, {
            "single": true
        });
        CQ.Ext.EventManager.on(this.image, "error", function() {
            if (this.fallbackUrl != null) {
                this.image.src = CQ.HTTP.noCaching(this.fallbackUrl);
            }
        }, this, {
            "single": true
        });
        if (CQ.Ext.isIE) {
            this.image.galleryimg = false;
        }
        this.image.src = CQ.HTTP.noCaching(this.url);
    },

    /**
     * Adds a tool-specific load handler.
     * @param {Function} fn The handler to be executed
     * @param {Boolean} runOnce True if the handler should only be executed once (i.e.
     *        on the next load operation that completes)
     */
    addToolLoadHandler: function(fn, runOnce) {
        var handlerDef = {
            "fn": fn,
            "runOnce": runOnce
        };
        this.toolLoadHandlers.push(handlerDef);
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
 * @class CQ.form.ExtendedSmartImage.ImagePanel
 * @private
 * The SmartImage.ImagePanel provides a panel that can be
 * used for displaying and processing images.
 * <p>
 * The implementation offers the following features:
 * <ul>
 * <li>Zooming</li>
 * <li>Scrolling</li>
 * <li>Shapes that can be displayed on top of the image</li>
 * <li>Shape sets that accumulate Shapes (for example the shapes used in a single tool) and
 * provide some functionality to manipulate these shapes as a whole</li>
 * <li>Basic implementation of user interactions (interactions have actually to be handled
 * by the Shape implementation, but SmartImage.ImagePanel provides the basic functionality
 * for deciding which Shape has to handle the interaction)</li>
 * </ul>
 */
CQ.form.ExtendedSmartImage.ImagePanel = CQ.Ext.extend(CQ.Ext.Panel, {

    // Properties --------------------------------------------------------------------------

    /**
     * Flag if the component is entirely initialized. This is only the case if the first
     * "resize" event (stating the actual size of the working area) has been received. There
     * should be no drawing operation and calculation before isInitialized == true.
     * @private
     * @type Boolean
     */
    isInitialized: false,

    /**
     * @cfg {String} backgroundColor
     * Background color; format: todo ???
     */
    backgroundColor: null,

    /**
     * The image to display/process; must be set separately using {@link #updateImage}
     * @private
     * @type CQ.form.ExtendedSmartImage.Image
     */
    imageToDisplay: null,

    /**
     * Zoom factor; 0 means "basic image size", 0.1 means "basic image size" * 1.1, and so
     * on
     * @private
     * @type Number
     * @see CQ.form.ExtendedSmartImage.ImagePanel#basicImageSize
     */
    zoom: 0,

    /**
     * Current rotation in degrees; currently only 0, 90, 180, 270 are supported
     * @private
     * @type Number
     */
    rotation: 0,

    /**
     * Ignores rotation setting if set to true
     * @private
     * @type Boolean
     */
    ignoreRotation: false,

    /**
     * Basic component size. This is the space available for all elements of the
     * ImagePanel, including scrollbars. Properties: width, height
     * @private
     * @type Object
     */
    basicSize: null,

    /**
     * Working area size. This is the space available for displaying and processing the
     * image. It is usually basicSize minus the size of the scrollbars. Properties:
     * width, height
     * @private
     * @type Object
     */
    workingAreaSize: null,

    /**
     * The original image size. Properties: width, height
     * @private
     * @type Object
     */
    originalImageSize: null,

    /**
     * The "basic image size". The basic image size is the size the image has in unzoomed
     * state. It is either the original size of the image (if it fits completely into
     * the working area) or a scaled-down version that fits completely into the working
     * area. Note that this value respects rotation. Properties: width, height
     * @private
     * @type Object
     */
    basicImageSize: null,

    /**
     * The zoomed size. This is the size of the image when displayed with the currently
     * set zoom factor. Note that this value respects rotation. Properties: width, height
     * @private
     * @type Object
     */
    zoomedImageSize: null,

    /**
     * The center point of the current view. The center point is in the center of the
     * current display state (considering scrollbar state) and is used when zooming in to
     * keep focus. The center point is calculated in the coordinate system of the original
     * image size. Properties: x, y
     * @private
     * @type Object
     */
    centerPoint: null,

    /**
     * The current internal display offsets. This object reflects the state of the
     * scrollbars and defines the image fragment actually displayed. Properties: x, y
     * @private
     * @type Object
     */
    internalOffset: null,

    /**
     * @cfg {Object} internalPadding
     * The internal display padding. The specified amount (of pixels) is at least available
     * as a visible border when editing an image. Properties: width (horizontal padding),
     * height (vertical padding). Note that the values specified are actually used for each
     * border; i.e. if a width of 4 is specified, actually each of the left and right
     * borders is set to 4 pixels, summing up to horizontal borders of 8 pixels altogehther.
     */
    internalPadding: null,

    /**
     * <p>The DOM object used for internally positioning the layers required by this
     * implementation.</p>
     * <p>Child nodes are: {@link #scrollerDiv and {@link #canvasDiv}</p>
     * @private
     * @type HTMLElement
     */
    positioningContainer: null,

    /**
     * <p>The DOM object used to display the scrollbars.</p>
     * <p>Child node is: {@link #spacerImage}</p>
     * @private
     * @type HTMLElement
     */
    scollerDiv: null,

    /**
     * <p>The DOM Image object used to determine the value range of the scrollbars. This
     * corresponds to the size of the working area or the zoomed size of the image,
     * whichever is bigger.</p>
     * <p>This is also used as the hotspot object (required for IE) and therefore always
     * kept "on top".</p>
     * @private
     * @type Image
     */
    spacerImage: null,

    /**
     * <p>The DOM object containing the canvas.</p>
     * <p>Child node is: {@link #imageCanvas}</p>
     * @private
     * @type HTMLElement
     */
    canvasDiv: null,

    /**
     * The image canvas (emulated for IE)
     * @private
     * @type HTMLElement
     */
    imageCanvas: null,

    /**
     * The distance between the left/top border of the working area to the respective
     * image border. The contained properties (x, y) are != 0 only if the image does not
     * fully cover the working area in the respective direction
     * @private
     */
    imageOffsets: null,

    /**
     * Table containing shape sets; Key: Shape set ID; Value: The
     * {@link CQ.form.ExtendedSmartImage.ShapeSet}
     * @private
     * @type Object
     */
    shapeSets: null,

    /**
     * Array with additional shape definitions which are required for correct handling
     * and display on Internet Explorer. Element properties: container (the DOM element
     * containing the emulated canvas object), canvas (the emulated canvas object), shape
     * (backreference to the shape the shape definition is used for)
     * @private
     * @type Object[]
     */
    shapeDefs: null,

    /**
     * Array with currently rolled over shapes
     * @private
     * @type CQ.form.ExtendedSmartImage.Shape[]
     */
    rolledOverShapes: null,

    /**
     * Array with currently selected shapes
     * @private
     * @type CQ.form.ExtendedSmartImage.Shape[]
     */
    selectedShapes: null,

    /**
     * Array with Shapes that are scheduled for dragging during the processing of an "add
     * request" event
     * @private
     * @type CQ.form.ExtendedSmartImage.Shape[]
     */
    scheduledDragShapes: null,

    /**
     * @cfg {Number} tolerance
     * The tolerance distance in pixels. This is the maximum distance the mouse pointer must
     * have to the outline of a shape to still be considered as being "on" that outline.
     * Defaults to 3.
     */
    tolerance: 0,

    /**
     * @cfg {String} canvasClass
     * CSS class to be used as canvas style
     */
    canvasClass: null,

    /**
     * Absolute tolerance distance
     * @private
     * @type Number
     * @see #tolerance
     */
    zoomedTolerance: 0,

    /**
     * Flag if rollover handling is currently blocked
     * @private
     * @type Boolean
     */
    isRollOverHandlingBlocked: false,

    /**
     * The current document, cached as a {@link CQ.Ext.Element}
     * @private
     * @type CQ.Ext.Element
     */
    doc: null,

    /**
     * Array of temporary handlers used for a better Drag &amp; Drop experience; will be
     * added by {@link #onMouseDown} and removed by {@link onMouseUp}; Element properties:
     * el (the {@link CQ.Ext.Element} the handler should be added to), handlerName (the
     * name of the event the handler is used for; i.e. "click", "mouseup", "mousedown"), fn,
     * scope
     * @private
     * @type Object[]
     */
    temporaryHandlers: null,


    // Object lifecycle --------------------------------------------------------------------

    constructor: function(config) {
        if (!config) {
            config = { };
        }
        var defaults = {
            "backgroundColor": CQ.themes.SmartImage.BACKGROUND_COLOR,
            "canvasClass": CQ.themes.SmartImage.CANVAS_CLASS,
            "border": false,
            "layout": "fit",
            "zoom": 0,
            "tolerance": 3,
            "internalPadding": {
                "width": 8,
                "height": 8
            }
        };
        this.addEvents(
            /**
             * @event smartimage.zoomchange
             * Fires after the zoom factor has changed.
             * @param {Number} zoom New zoom factor
             * @deprecated Use {@link CQ.form.ExtendedSmartImage.ImagePanel#zoomchange zoomchange} instead
             */
            "smartimage.zoomchange",
            /**
             * @event zoomchange
             * Fires after the zoom factor has changed.
             * @param {Number} zoom New zoom factor
             * @since 5.3
             */
            "zoomchange",

            /**
             * @event smartimage.addrequest
             * Fires when the image panel has detected a click that could be interpreted
             * as a request by the user to add a new object (i.e. doesn't select or drag
             * anything)
             * @param {Object} coords The coordinates for this event
             * @deprecated Use {@link CQ.form.ExtendedSmartImage.ImagePanel#addrequest addrequest} instead
             */
            "smartimage.addrequest",
            /**
             * @event addrequest
             * Fires when the image panel has detected a click that could be interpreted
             * as a request by the user to add a new object (i.e. doesn't select or drag
             * anything)
             * @param {Object} coords The coordinates for this event
             * @since 5.3
             */
            "addrequest",

            /**
             * @event smartimage.custom
             * A customized event that is related to the shape that fires it.
             * @deprecated This event has actually never been used/fired
             */
            "smartimage.custom",

            /**
             * @event smartimage.selchanged
             * Fired after the selection changed
             * @param {CQ.form.ExtendedSmartImage.Shape[]} selectedShapes Array of all shapes that
             *        are currently selected
             * @deprecated Use {@link CQ.form.ExtendedSmartImage.ImagePanel#selectionchange selectionchange} instead
             */
            "smartimage.selchanged",
            /**
             * @event selectionchange
             * Fired after the selection changed
             * @param {CQ.form.ExtendedSmartImage.Shape[]} selectedShapes Array of all shapes that
             *        are currently selected
             * @since 5.3
             */
            "selectionchange",

            /**
             * @event smartimage.rollover
             * Fired after one or more shapes changed its/their rollover state.
             * @param {CQ.form.ExtendedSmartImage.Shape[]} selectedShapes Array of all shapes that
             *        are currently rolled over
             * @deprecated Use {@link CQ.form.ExtendedSmartImage.ImagePanel#rollover rollover} instead
             */
            "smartimage.rollover",
            /**
             * @event rollover
             * Fired after one or more shapes changed its/their rollover state.
             * @param {CQ.form.ExtendedSmartImage.Shape[]} selectedShapes Array of all shapes that
             *        are currently rolled over
             * @since 5.3
             */
            "rollover",

            /**
             * @event smartimage.dragchange
             * Fired after one or more shapes changed their state through Drag &amp; Drop.
             * @param {CQ.form.ExtendedSmartImage.Shape[]} draggedShapes Array of all shapes that
             *        are affected by this event
             * @param {Boolean} isDragEnd True if the event signals the end of a drag
             *        operation
             * @deprecated Use {@link CQ.form.ExtendedSmartImage.ImagePanel#dragchange dragchange} instead
             */
            "smartimage.dragchange",
            /**
             * @event dragchange
             * Fired after one or more shapes changed their state through Drag &amp; Drop.
             * @param {CQ.form.ExtendedSmartImage.Shape[]} draggedShapes Array of all shapes that
             *        are affected by this event
             * @param {Boolean} isDragEnd True if the event signals the end of a drag
             *        operation
             * @since 5.3
             */
            "dragchange",

            /**
             * @event smartimage.contentchange
             * Fired after the content changed through one of the tools and other tools
             * should adjust theirselves to these changes. For example: If rotation is
             * changed, any tool might want to rotate its content accordingly.
             * @param {Object} changeDef An object that describes the content change;
             *        property changeType is used as an identifier for the change; if
             *        change type is "rotate": property newValue (Number) describes the
             *        new rotation angle (in degrees, property valueDelta (Number) describes
             *        the difference between old and new rotation angles (in degrees)
             * @deprecated Use {@link CQ.form.ExtendedSmartImage.ImagePanel#contentchange contentchange} instead
             */
            "smartimage.contentchange",
            /**
             * @event contentchange
             * Fired after the content changed through one of the tools and other tools
             * should adjust theirselves to these changes. For example: If rotation is
             * changed, any tool might want to rotate its content accordingly.
             * @param {Object} changeDef An object that describes the content change;
             *        property changeType is used as an identifier for the change; if
             *        change type is "rotate": property newValue (Number) describes the
             *        new rotation angle (in degrees, property valueDelta (Number) describes
             *        the difference between old and new rotation angles (in degrees)
             * @since 5.3
             */
            "contentchange",

            /**
             * @event smartimage.defaultview
             * Event that is fired when the component is switched to default view (no zoom
             * applied, no active tool).
             * @deprecated Use {@link CQ.form.ExtendedSmartImage.ImagePanel#defaultview defaultview} instead
             */
            "smartimage.defaultview",
            /**
             * @event defaultview
             * Event that is fired when the component is switched to default view (no zoom
             * applied, no active tool).
             * @since 5.3
             */
            "defaultview"
        );
        CQ.Util.applyDefaults(config, defaults);
        CQ.form.ExtendedSmartImage.ImagePanel.superclass.constructor.call(this, config);
        this.shapeSets = { };
        this.rolledOverShapes = [ ];
        this.selectedShapes = [ ];
        this.scheduledDragShapes = [ ];
        this.internalOffset = {
            "x": 0,
            "y": 0
        };
    },

    /**
     * <p>Creates all necessary DOM objects for the canvas implementation and necessary
     * helper objects (mostly required for IE compatibility reasons).</p>
     * <p>Note that all DOM objects are created without sizes. The correct sizes will be
     * set in the first call to {@link notifyResize}, when it is ensured that the
     * ancestor objects have already been calculated/sized.</p>
     * @param {Mixed} ct container element
     * @param {Number} pos insert position
     */
    onRender: function(ct, pos) {
        CQ.form.ExtendedSmartImage.ImagePanel.superclass.onRender.call(this, ct, pos);

        this.el.setVisibilityMode(CQ.Ext.Element.DISPLAY);

        // create a surrounding DIV, used as a positioning container
        this.positioningContainer = document.createElement("div");
        this.positioningContainer.style.position = "relative";
        this.positioningContainer.style.top = "0";
        this.positioningContainer.style.left = "0";
        this.body.dom.appendChild(this.positioningContainer);

        // create a DIV for the canvas and add the default canvas to it
        this.canvasDiv = document.createElement("div");
        this.canvasDiv.style.position = "absolute";
        this.canvasDiv.style.top = "0";
        this.canvasDiv.style.left = "0";
        this.positioningContainer.appendChild(this.canvasDiv);

        // create a DIV used for scrolling and as a container for a spacer (as required
        // by Internet Explorer to have a topmost hotspot layer)
        this.scrollerDiv = document.createElement("div");
        this.scrollerDiv.style.position = "absolute";
        this.scrollerDiv.style.top = "0";
        this.scrollerDiv.style.left = "0";
        this.scrollerDiv.style.overflow = "scroll";
        CQ.Ext.EventManager.on(this.scrollerDiv, "scroll", this.handleScroll, this);
        this.positioningContainer.appendChild(this.scrollerDiv);

        // create hotspot spacer
        this.spacerImage = document.createElement("img");
        this.spacerImage.src = CQ.Ext.BLANK_IMAGE_URL;
        this.scrollerDiv.appendChild(this.spacerImage);
        // display: block required for Firefox
        this.spacerImage.style.display = "block";
        // deactivate image toolbar (IE)
        if (CQ.Ext.isIE) {
            this.spacerImage.galleryimg = false;
        }

        this.imageCanvas = this.createCanvas(this.canvasDiv, 1, 1);
        this.doc = CQ.Ext.get(document);

        if (this.canvasClass) {
            CQ.Ext.get(this.imageCanvas).addClass(this.canvasClass);
        }
        if (this.backgroundColor != null) {
            this.imageCanvas.style.backgroundColor = this.backgroundColor;
        }

        // register handlers
        CQ.Ext.EventManager.on(this.spacerImage, "mousemove", this.onMouseMove, this);
        CQ.Ext.EventManager.on(this.spacerImage, "mousedown", this.onMouseDown, this);
        CQ.Ext.EventManager.on(this.spacerImage, "mouseup", this.onMouseUp, this);
        CQ.Ext.EventManager.on(this.spacerImage, "mouseout", this.onComponentLeave, this);
    },


    // Canvas styling ----------------------------------------------------------------------

    /**
     * Adds the specified CSS class to the canvas.
     * @param {String} classToAdd The CSS class to add
     */
    addCanvasClass: function(classToAdd) {
        CQ.Ext.get(this.imageCanvas).addClass(classToAdd);
    },

    /**
     * Removes the specified CSS class from the canvas
     * @param {String} classToRemove The CSS class to remove
     */
    removeCanvasClass: function(classToRemove) {
        CQ.Ext.get(this.imageCanvas).removeClass(classToRemove);
    },


    // Image handling ----------------------------------------------------------------------

    /**
     * <p>Updates the image to display/process.</p>
     * <p>The method can deal with not yet fully loaded images. The zoom factor is reset and
     * all working areas are initialized once the image is fully loaded (or immediately, if
     * the image is already available).</p>
     * @param {CQ.form.ExtendedSmartImage.Image} image the image to display/process
     */
    updateImage: function(image) {
        this.imageToDisplay = image;
        if (this.rendered) {
            if (this.imageToDisplay.isLoaded) {
                this.handleImageLoaded();
            } else {
                var oldLoadHandler = this.imageToDisplay.loadHandler;
                this.imageToDisplay.loadHandler = function() {
                    this.handleImageLoaded();
                    if (oldLoadHandler) {
                        oldLoadHandler(this.imageToDisplay);
                    }
                }.createDelegate(this);
            }
        }
    },

    /**
     * Switches to the default view, which is the most suitable image (usually the processed
     * image) without any tool selected.
     */
    switchToDefaultView: function() {
        this.fireEvent("defaultview");
        this.fireEvent("smartimage.defaultview"); // deprecated as of 5.3
        this.setZoom(0);
        this.fireEvent("zoomchange", 0);
        this.fireEvent("smartimage.zoomchange", 0);  // deprecated as of 5.3
    },


    // Event handling ----------------------------------------------------------------------

    /**
     * <p>Handler that reacts on resizing the surrounding dialog.</p>
     * <p>Note that we can't override Ext's onResize method, as it doesn't seem to work
     * with CardLayouts properly.</p>
     * @param {Number} width New width of the ImagePanel
     * @param {Number} height New height if the ImagePanel
     */
    notifyResize: function(width, height) {
        this.body.setSize(width, height);
        this.calculateBasicSize();
        this.propagateWorkingArea(this.notifyResizeAsync.createDelegate(this));
    },

    /**
     * <p>Asynchronous part of {@link #notifyResize}. Will be called after notifyResize's
     * call to {@link #propagateWorkingArea} (which has some asynchronous parts due to
     * browser issues) has completed.</p>
     * @private
     */
    notifyResizeAsync: function() {
        if (CQ.Ext.isIE && this.shapeDefs) {
            var shapeCnt = this.shapeDefs.length;
            for (var shapeIndex = 0; shapeIndex < shapeCnt; shapeIndex++) {
                var shapeDef = this.shapeDefs[shapeIndex];
                this.setCanvasSize(shapeDef.canvas, this.workingAreaSize);
            }
        }
        if (this.imageToDisplay && this.imageToDisplay.isLoaded) {
            this.calculateBasicImageSize();
            this.calculateZoomedImageSize();
            this.adjustSpacerImage();
            this.propagateImage();
        }
        this.isInitialized = true;
    },

    /**
     * <p>Handler for mouse move events.</p>
     * <p>If a drag &amp; drop operation is active, the dragging is handled. If a deferred
     * drag &amp; drop operation is scheduled and the user has dragged it the required
     * minimum distance, the deferred drag operation becomes active.</p>
     * <p>If no drag &amp; drop has to be handled, the rollover handling is done instead:
     * The onRollOver/onRollOut/onRolledOver handlers of registered and visible
     * {@link CQ.form.ExtendedSmartImage.Shape}s are called accordingly.
     * @param {Event} event The mouse click event
     */
    onMouseMove: function(event) {
        if (!this.zoomedImageSize) {
            return;
        }
        var isWaitingForDeferredDrag = false;
        var transformedCoords = this.calculateTransformedCoords(event);
        if (this.deferredDragShapes != null) {
            // deferred Drag & Drop
            isWaitingForDeferredDrag = true;
            if (transformedCoords.isVirtual) {
                return;
            }
            var delta = this.calculateDistance(
                this.draggingBaseCoords.unzoomedUnclipped,
                transformedCoords.unzoomedUnclipped);
            if (delta >= this.zoomedTolerance) {
                this.directDragShapes = this.deferredDragShapes;
                this.fireDragStart(this.draggingBaseCoords);
                this.deferredDragShapes = null;
            }
        }
        if (this.directDragShapes != null) {
            // Drag & Drop
            var refCoords = transformedCoords.unzoomedUnclipped;
            var xOffs = refCoords.x - this.draggingBaseCoords.unzoomed.x;
            var yOffs = refCoords.y - this.draggingBaseCoords.unzoomed.y;
            this.fireMove(xOffs, yOffs, transformedCoords);
            this.fireEvent("dragchange", this.directDragShapes, false);
            this.fireEvent("smartimage.dragchange", this.directDragShapes, false); // deprecated as of 5.3
        } else if (!isWaitingForDeferredDrag && !this.isRollOverHandlingBlocked) {
            this.executeFnOnShapes(function(shape) {
                var isRollover = (this.rolledOverShapes.indexOf(shape) >= 0);
                var isTouched = shape.isTouched(transformedCoords, this.zoomedTolerance);
                if (isTouched != isRollover) {
                    if (isTouched) {
                        this.addShapeToRollovers(shape, transformedCoords);
                    } else {
                        this.removeShapeFromRollovers(shape, transformedCoords);
                    }
                } else if (isTouched) {
                    // send onRolledOver if the shape is still rolled over, but the
                    // mouse has moved
                    if (shape.onRolledOver(transformedCoords)) {
                        this.drawImage();
                    }
                }
            }.createDelegate(this), true);
            this.fireEvent("rollover", this.rolledOverShapes);
            this.fireEvent("smartimage.rollover", this.rolledOverShapes); // deprecated as of 5.3
        }
        if (!CQ.Ext.isIE) {
            event.stopPropagation();
        } else {
            return false;
        }
    },

    /**
     * <p>Handler for "leaving the component when no dragging is active".</p>
     * <p>Sends onRollOut events to all {@link CQ.form.ExtendedSmartImage.Shape}s that are currently
     * rolled over.</p>
     */
    onComponentLeave: function() {
        // pointer is not on the image anymore -> send onRollout events to all
        // shapes that are currently rolled over if there is no drag & drop operation active
        // at the moment
        if (this.directDragShapes == null) {
            var requiresRedraw = false;
            var shapeCnt = this.rolledOverShapes.length;
            for (var shapeIndex = 0; shapeIndex < shapeCnt; shapeIndex++) {
                var shapeToRollOut = this.rolledOverShapes[shapeIndex];
                if (shapeToRollOut.onRollOut()) {
                    requiresRedraw = true;
                }
            }
            this.rolledOverShapes.length = 0;
            if (requiresRedraw) {
                this.drawImage();
            }
            this.fireEvent("rollover", [ ]);
            this.fireEvent("smartimage.rollover", [ ]); // deprecated as of 5.3
        }
    },

    /**
     * <p>Handler for mouse down events.</p>
     * <p>All currently rolled over shapes are checked if any of them is available for
     * "direct dragging", which is usually the case when a point move is executed rather
     * than a "whole shape" move. If no direct dragging is possible, shapes that signal
     * a "deferred dragging" (which is executed only when the user has dragged the shape
     * over a certain distance, as defined by the {@link tolerance} property) are
     * collected and marked for becoming active later.</p>
     * @param {Event} event The mouse event
     */
    onMouseDown: function(event) {
        if (!this.zoomedImageSize) {
            return;
        }
        var coords = this.calculateTransformedCoords(event);
        this.scheduledDragShapes.length = 0;
        this.fireEvent("addrequest", coords);
        this.fireEvent("smartimage.addrequest", coords); // deprecated as of 5.3
        var scheduledDragCnt = this.scheduledDragShapes.length;
        if ((this.rolledOverShapes.length > 0) || (scheduledDragCnt > 0)) {
            var directDragShapes = [ ];
            var deferredDragShapes = [ ];
            var shapeCnt = this.rolledOverShapes.length;
            for (var shapeIndex = 0; shapeIndex < shapeCnt; shapeIndex++) {
                var shapeToCheck = this.rolledOverShapes[shapeIndex];
                if (shapeToCheck.isDirectlyDraggable(coords, this.zoomedTolerance)) {
                    directDragShapes.push(shapeToCheck);
                } else if (shapeToCheck.isDeferredDraggable(coords, this.zoomedTolerance)) {
                    deferredDragShapes.push(shapeToCheck);
                }
            }
            for (var scheduleIndex = 0; scheduleIndex < scheduledDragCnt; scheduleIndex++) {
                var shapeToAdd = this.scheduledDragShapes[scheduleIndex];
                shapeToAdd.onAddForDrag(coords);
                directDragShapes.push(shapeToAdd);
            }
            if (directDragShapes.length > 0) {
                this.directDragShapes = directDragShapes;
                this.deferredDragShapes = null;
                this.draggingBaseCoords = coords;
                this.fireDragStart(coords);
                this.fireEvent("dragchange", this.directDragShapes, false);
                this.fireEvent("smartimage.dragchange", this.directDragShapes, false); // deprecated as of 5.3
            } else if (deferredDragShapes.length > 0) {
                this.directDragShapes = null;
                this.deferredDragShapes = deferredDragShapes;
                this.draggingBaseCoords = coords;
            } else {
                this.directDragShapes = null;
                this.deferredDragShapes = null;
                this.draggingBaseCoords = null;
            }
        }
        this.addTemporaryHandler(this.doc, "mousemove", this.onMouseMove, this);
        // IE will send mouseUp automatically to the object that received the mouseDown
        // event, but Firefox sends it to the object that currently is under the mouse
        // pointer, so we will install a mouseup handler on the document that forwards
        // it to the correct mouseUp handler
        if (CQ.Ext.isGecko) {
            this.addTemporaryHandler(this.doc, "mouseup",  this.onMouseUp, this);
        }
    },

    /**
     * <p>Handler for mouse up events.</p>
     * <p>All currently rolled over shapes are checked if any of them is available for
     * "direct dragging", which is usually the case when a point move is executed rather
     * than a "whole shape" move. If no direct dragging is possible, shapes that signal
     * a "deferred dragging" (which is executed only when the user has dragged the shape
     * over a certain distance, as defined by the {@link #tolerance} property.</p>
     * @param {Event} event The mouse event
     */
    onMouseUp: function(event) {
        if (!this.zoomedImageSize) {
            return;
        }
        var coords = this.calculateTransformedCoords(event);
        var calcCoords = coords.unzoomedUnclipped;
        var isDragEnded = false;
        if ((this.directDragShapes != null) || (this.deferredDragShapes != null)) {
            if (this.directDragShapes != null) {
                isDragEnded = true;
                var xOffs = calcCoords.x - this.draggingBaseCoords.unzoomedUnclipped.x;
                var yOffs = calcCoords.y - this.draggingBaseCoords.unzoomedUnclipped.y;
                this.fireMove(xOffs, yOffs, coords);
                this.fireDragEnd(coords);
                this.fireEvent("dragchange", this.directDragShapes, true);
                this.fireEvent("smartimage.dragchange", this.directDragShapes, true); // deprecated since 5.3
                this.directDragShapes = null;
            }
            this.deferredDragShapes = null;
            this.draggingBaseCoords = null;
        }
        if (!isDragEnded) {
            this.selectRollovers();
        } else {
            this.onMouseMove(event);
        }
        if (!CQ.Ext.isIE) {
            event.stopPropagation();
        }
        this.removeTemporaryHandlers();
    },

    /**
     * Fires a "move" event to all shapes that are affected by a drag operation.
     * @param {Number} xOffs The horizontal move offset
     * @param {Number} yOffs The vertical move offset
     * @param {Object} coords The actual coordinates (properties: x, y)
     */
    fireMove: function(xOffs, yOffs, coords) {
        var requestRepaint = false;
        var shapeCnt = this.directDragShapes.length;
        for (var shapeIndex = 0; shapeIndex < shapeCnt; shapeIndex++) {
            var shapeToNotify = this.directDragShapes[shapeIndex];
            if (shapeToNotify.moveShapeBy(xOffs, yOffs, coords)) {
                requestRepaint = true;
            }
        }
        if (requestRepaint) {
            this.drawImage();
        }
    },

    /**
     * Fires an event that signals the begin of a drag operation to all affected
     * shapes.
     * @param {Object} coords Coordinates where the dragging begins
     */
    fireDragStart: function(coords) {
        var requestRepaint = false;
        var shapeCnt = this.directDragShapes.length;
        for (var shapeIndex = 0; shapeIndex < shapeCnt; shapeIndex++) {
            var shapeToNotify = this.directDragShapes[shapeIndex];
            if (shapeToNotify.onDragStart(coords, this.zoomedTolerance)) {
                requestRepaint = true;
            }
        }
        if (requestRepaint) {
            this.drawImage();
        }
    },

    /**
     * Fires an event that signals the end of a drag operation to all affected
     * shapes.
     * @param {Object} coords Coordinates where the dragging ends (properties: x, y)
     */
    fireDragEnd: function(coords) {
        var requestRepaint = false;
        var shapeCnt = this.directDragShapes.length;
        for (var shapeIndex = 0; shapeIndex < shapeCnt; shapeIndex++) {
            var shapeToNotify = this.directDragShapes[shapeIndex];
            if (shapeToNotify.onDragEnd(coords, this.zoomedTolerance)) {
                requestRepaint = true;
            }
        }
        if (requestRepaint) {
            this.drawImage();
        }
    },

    /**
     * <p>Adds a temporary handler to the specified {@link CQ.Ext.Element}.</p>
     * <p>Temporary handler can be removed at once using {@link #removeTemporaryHandlers}.
     * </p>
     * @param {CQ.Ext.Element} el The element the handler is added to
     * @param {String} handlerName Name of the event ("mouseup", "mousedown", etc.)
     * @param {Function} fn Handler function
     * @param {Object} scope (optional) The scope the handler is executed in
     */
    addTemporaryHandler: function(el, handlerName, fn, scope) {
        if (this.temporaryHandlers == null) {
            this.temporaryHandlers = [ ];
        }
        var handlerDef = {
            "el": el,
            "handlerName": handlerName,
            "fn": fn,
            "scope": scope
        };
        this.temporaryHandlers.push(handlerDef);
        el.on(handlerName, fn, scope);
    },

    /**
     * Removes all temporary handlers at once.
     */
    removeTemporaryHandlers: function() {
        if (this.temporaryHandlers != null) {
            var removeCnt = this.temporaryHandlers.length;
            for (var removeIndex = 0; removeIndex < removeCnt; removeIndex++) {
                var handlerToRemove = this.temporaryHandlers[removeIndex];
                handlerToRemove.el.un(handlerToRemove.handlerName, handlerToRemove.fn,
                        handlerToRemove.scope);
            }
            this.temporaryHandlers = null;
        }
    },


    // Rollover handling -------------------------------------------------------------------

    /**
     * <p>Blocks rollover handling.</p>
     * <p>All necessary events are sent accordingly.</p>
     */
    blockRollOver: function() {
        this.isRollOverHandlingBlocked = true;
        var removeCnt = this.rolledOverShapes.length;
        for (var removeIndex = removeCnt - 1; removeIndex >= 0; removeIndex--) {
            this.removeShapeFromRollovers(this.rolledOverShapes[removeIndex]);
        }
        this.drawImage();
        this.fireEvent("rollover", this.rolledOverShapes);
        this.fireEvent("smartimage.rollover", this.rolledOverShapes); // deprecated as of 5.3
    },

    /**
     * Unblocks rollover handling.
     */
    unblockRollOver: function() {
        this.isRollOverHandlingBlocked = false;
    },

    /**
     * <p>Adds a shape to the list of currently rolled over shapes.</p>
     * <p>A onRollOver event is sent accordingly. Note that the system event
     * "smartimage.rollover" has to be sent explicitly.</p>
     * @param {CQ.form.ExtendedSmartImage.Shape} shapeToAdd The shape to add
     * @param {Object} coords Coordinates of the rollover
     */
    addShapeToRollovers: function(shapeToAdd, coords) {
        this.rolledOverShapes.push(shapeToAdd);
        if (shapeToAdd.onRollOver(coords)) {
            this.drawImage();
        }
    },

    /**
     * <p>Removes a shape from the list of currently rolled over shapes.</p>
     * <p>A onRollOut event is sent accordingly. Note that the system event
     * "smartimage.rollover" has to be sent explicitly.</p>
     * @param {CQ.form.ExtendedSmartImage.Shape} shapeToRemove The shape to remove
     * @param {Object} coords Coordinates of the rollover
     * @param {Boolean} blockRedraw (optional) True if redrawing the image should be blocked
     */
    removeShapeFromRollovers: function(shapeToRemove, coords, blockRedraw) {
        var index = this.rolledOverShapes.indexOf(shapeToRemove);
        if (index >= 0) {
            this.rolledOverShapes.splice(index, 1);
            if (shapeToRemove.onRollOut(coords) && !blockRedraw) {
                this.drawImage();
            }
        }
    },

    /**
     * Returns a snapshot of the currently rolled over shapes.
     * @return {CQ.form.ExtendedSmartImage.Shape[]} Array of currently rolled over shapes
     */
    getRolledOverShapes: function() {
        var rolledOverShapes = [ ];
        var shapeCnt = this.rolledOverShapes.length;
        for (var shapeIndex = 0; shapeIndex < shapeCnt; shapeIndex++) {
            rolledOverShapes.push(this.rolledOverShapes[shapeIndex]);
        }
        return rolledOverShapes;
    },


    // Selection handling ------------------------------------------------------------------

    /**
     * <p>Selects the currently rolled over shape(s).</p>
     * <p>Internal events (select/unselect) are relayed to all shapes that are affected.
     * Additionally, a "smartimage.selchanged" system event is fired.</p>
     * @return {Boolean} True if something has actually been selected or unselected
     */
    selectRollovers: function() {
        var hasChangedAnything = false;
        var requiresRedraw = false;
        var shapeIndex;
        var unselectShapeCnt = this.selectedShapes.length;
        for (shapeIndex = 0; shapeIndex < unselectShapeCnt; shapeIndex++) {
            var shapeToUnselect = this.selectedShapes[shapeIndex];
            if (this.rolledOverShapes.indexOf(shapeToUnselect) < 0) {
                hasChangedAnything = true;
                if (shapeToUnselect.onUnSelect()) {
                    requiresRedraw = true;
                }
            }
        }
        var selectedShapes = [ ];
        var selectShapeCnt = this.rolledOverShapes.length;
        for (shapeIndex = 0; shapeIndex < selectShapeCnt; shapeIndex++) {
            hasChangedAnything = true;
            var clickedShape = this.rolledOverShapes[shapeIndex];
            selectedShapes.push(clickedShape);
            if (this.selectedShapes.indexOf(clickedShape) < 0) {
                if (clickedShape.onSelect()) {
                    requiresRedraw = true;
                }
            }
            if (clickedShape.onClick()) {
                requiresRedraw = true;
            }
        }
        this.selectedShapes = selectedShapes;
        if (requiresRedraw) {
            this.drawImage();
        }
        CQ.Log.debug("Firing selection change event.");
        this.fireEvent("selectionchange", selectedShapes);
        this.fireEvent("smartimage.selchanged", selectedShapes); // deprecated as of 5.3
        return hasChangedAnything;
    },

    /**
     * <p>Clears the current selection.</p>
     * <p>Internal events (unselect) are relayed to all shapes that are affected.
     * Additionally, a "smartimage.selchanged" event is fired.</p>
     * @return {CQ.form.ExtendedSmartImage.Shape[]} Array of shapes that were unselected
     */
    clearSelection: function() {
        var requiresRedraw = false;
        var unselectShapeCnt = this.selectedShapes.length;
        for (var shapeIndex = 0; shapeIndex < unselectShapeCnt; shapeIndex++) {
            var shapeToUnselect = this.selectedShapes[shapeIndex];
            if (shapeToUnselect.onUnSelect()) {
                requiresRedraw = true;
            }
        }
        var unselectedShapes = this.selectedShapes;
        this.selectedShapes = [ ];
        this.fireEvent("selectionchange", this.selectedShapes);
        this.fireEvent("smartimage.selchanged", this.selectedShapes); // deprecated as of 5.3
        return unselectedShapes;
    },

    /**
     * <p>Deletes all currently selected shapes.</p>
     * <p>A "smartimage.selchanged" event is fired and a redraw is executed.</p>
     */
    deleteSelectedShapes: function() {
        var selectionCnt = this.selectedShapes.length;
        if (selectionCnt > 0) {
            for (var selectionIndex = 0; selectionIndex < selectionCnt; selectionIndex++) {
                var shapeToRemove = this.selectedShapes[selectionIndex];
                var shapeSet = this.getSuitableShapeSet(shapeToRemove);
                shapeSet.removeShape(shapeToRemove);
            }
            this.drawImage();
            this.selectedShapes.length = 0;
            this.fireEvent("selectionchange", this.selectedShapes);
            this.fireEvent("smartimage.selchanged", this.selectedShapes); // deprecated as of 5.3
        }
    },

    /**
     * Returns a snapshot of the currently selected shapes.
     * @return {CQ.form.ExtendedSmartImage.Shape[]} Array with currently selected shapes
     */
    getSelectedShapes: function() {
        var selectedShapes = [ ];
        var selectedCnt = this.selectedShapes.length;
        for (var selectedIndex = 0; selectedIndex < selectedCnt; selectedIndex++) {
            selectedShapes.push(this.selectedShapes[selectedIndex]);
        }
        return selectedShapes;
    },

    /**
     * <p>Selects the specified shape.</p>
     * <p>All required events are fired accordingly.</p>
     * @param {CQ.form.ExtendedSmartImage.Shape} shapeToSelect The shape to add to the current
     *        selection
     * @param {Boolean} clearSelection (optional) True if the current selection has to be
     *        cleared before adding the specified shape
     */
    selectShape: function(shapeToSelect, clearSelection) {
        if (clearSelection === true) {
            var selectionCnt = this.selectedShapes.length;
            for (var selectionIndex = 0; selectionIndex < selectionCnt; selectionIndex++) {
                var shapeToRemove = this.selectedShapes[selectionIndex];
                var shapeSet = this.getSuitableShapeSet(shapeToRemove);
                shapeSet.removeShape(shapeToRemove);
            }
            this.selectedShapes.length = 0;
        }
        shapeToSelect.onSelect();
        this.selectedShapes.push(shapeToSelect);
        this.fireEvent("selectionchange", this.selectedShapes);
        this.fireEvent("smartimage.selchanged", this.selectedShapes); // deprecated as of 5.3
    },


    // Access to component's state ---------------------------------------------------------

    /**
     * <p>Gets the absolute tolerance distance.</p>
     * <p>This value will change when the zoom is changed, so the value should not be stored
     * by the caller.</p>
     * @return {Number} The absolute tolerance distance (in pixels)
     */
    getTolerance: function() {
        return this.zoomedTolerance;
    },


    // Calculating sizes -------------------------------------------------------------------

    /**
     * Calculates the current "basic size" (that is the working area including scrollbars,
     * provided by the body area of the basic panel) to the data model
     * ({@link #basicSize}).
     * @private
     */
    calculateBasicSize: function() {
        this.basicSize = {
            "width": this.body.dom.clientWidth,
            "height": this.body.dom.clientHeight
        };
    },

    /**
     * <p>Calculates the current working area (= the currently visible part of the zoomed
     * image) to the data model ({@link #workingAreaSize}).</p>
     * <p>The {@link #scrollerDiv} property must be available when calling this method.</p>
     * @private
     */
    calculateWorkingAreaSize: function() {
        this.workingAreaSize = {
            "width": this.scrollerDiv.clientWidth,
            "height": this.scrollerDiv.clientHeight
        };
    },

    /**
     * <p>Caclulates the original (= without any zooming applied) size of the current image
     * to the data model ({@link #originalImageSize}).
     * <p>The {@link #imageToDisplay} must have been loaded completely before calling this
     * method.</p>
     * @private
     */
    calculateOriginalImageSize: function() {
        this.originalImageSize = {
            "width": this.imageToDisplay.width,
            "height": this.imageToDisplay.height,
            "ratio": (this.imageToDisplay.width / this.imageToDisplay.height)
        };
    },

    /**
     * Calculates zoomed sizes/coordinates from the specified size/position object.
     * @param {Number} zoom Zoom factor
     * @param {Object} obj Size (properties: width, height) or coordinates (properties:
     *        x, y) object to be zoomed
     * @return {Object} The zoomed size/position; properties: width, height (size) or
     *         x, y (coordinates)
     */
    calculateZoom: function(zoom, obj) {
        if (obj.width !== undefined) {
            return {
                "width": Math.round((zoom + 1) * obj.width),
                "height": Math.round((zoom + 1) * obj.height)
            };
        } else if (obj.x !== undefined) {
            return {
                "x": Math.round((zoom + 1) * obj.x),
                "y": Math.round((zoom + 1) * obj.y)
            };
        }
        return null;
    },

    /**
     * Calculates the absolute zoom factor, i.e. the zoom factor regarding the original
     * image, not the (probably already zoomed) basic image.
     * @private
     * @return {Number} The absolute zoom factor
     */
    calculateAbsoluteZoom: function() {
        return ((this.zoom + 1) * this.basicImageSize.baseZoom) - 1;
    },

    /**
     * Calculates inverse zoomed sizes/coordinates from the specified size/coordinates
     * object (i.e. calculates the original size/position from a zoomed size/position).
     * @param {Number} zoom The zoom factor
     * @param {Object} zoomedObj Zoomed size (properties: width, height) or coordinates
     *        (properties: x, y) object
     * @return {Object} The original size/position; properties: width, height (size) or
     *         x, y (coordinates)
     */
    calculateInverseZoom: function(zoom, zoomedObj) {
        if (zoomedObj.width !== undefined) {
            return {
                "width": Math.round(zoomedObj.width / (zoom + 1)),
                "height": Math.round(zoomedObj.height / (zoom + 1))
            };
        } else if (zoomedObj.x !== undefined) {
            return {
                "x": Math.round(zoomedObj.x / (zoom + 1)),
                "y": Math.round(zoomedObj.y / (zoom + 1))
            };
        }
        return null;
    },

    /**
     * <p>Calculates the basic image size for the specified rotation angle.</p>
     * <p>The basic image size is the size used for "zoom factor 1" and is either the
     * original image size or a scaled down size that fits completely to the current
     * working area.</p>
     * <p>{@link #workingArea} and {@link #originalImageSize} must have been calculated
     * beforehand.</p>
     * @param {Number} angle The rotation angle (0, 90, 180, 270) to calculate the basic
     *        image size for
     * @return {Object} The zoomed image size for the specified angle; properties: width,
     *         height, displayWidth (width + padding; see {@link #internalPadding}),
     *         displayHeight (height + padding; see {@link #internalPadding}), baseZoom
     *         (basic zoom factor; to be used if the zoom slider is in its leftmost
     *         position)
     */
    calculateBasicImageSizeForAngle: function(angle) {
        while (angle < 0) {
            angle += 360;
        }
        angle = angle % 360;
        var width = this.originalImageSize.width;
        var height = this.originalImageSize.height;
        var ratio = this.originalImageSize.ratio;
        if ((angle == 90) || (angle == 270)) {
            var temp = width;
            width = height;
            height = temp;
            ratio = 1 / ratio;
        }
        var originalWidth = width;
        var displayWidth = width + (this.internalPadding.width * 2);
        var displayHeight = height + (this.internalPadding.height * 2);
        var availWidth = this.workingAreaSize.width;
        var availHeight = this.workingAreaSize.height;
        if (displayWidth > availWidth) {
            displayWidth = availWidth;
            width = displayWidth - this.internalPadding.width * 2;
            height = Math.round(width / ratio);
            displayHeight = height + this.internalPadding.height * 2;
        }
        if (displayHeight > availHeight) {
            displayHeight = availHeight;
            height = displayHeight - this.internalPadding.height * 2;
            width = Math.round(height * ratio);
            displayWidth = width + this.internalPadding.width * 2;
        }
        if (width < 1) {
            width = 1;
        }
        if (height < 1) {
            height = 1;
        }
        return {
            "width": width,
            "height": height,
            "displayWidth": displayWidth,
            "displayHeight": displayHeight,
            "baseZoom": (width / originalWidth)
        };
    },

    /**
     * <p>Calculates the current basic image size to the data model. The current rotation
     * settings are handled accordingly.</p>
     * <p>The basic image size is the size used for "zoom factor 1" and is either the
     * original image size or a scaled down size that fits in the current working area.</p>
     * <p>{@link #workingArea} and {@link #originalImageSize} must have been calculated
     * beforehand.</p>
     */
    calculateBasicImageSize: function() {
        this.basicImageSize =
                this.calculateBasicImageSizeForAngle(this.getActualRotation());
    },

    /**
     * Calculates the zoomed image size using the currently set zoom factor and the basic
     * image size, which must have been calculated before using
     * {@link #calculateBasicImageSize}, and propagates it to the data model.
     */
    calculateZoomedImageSize: function() {
        this.zoomedImageSize = this.calculateZoom(this.zoom, this.basicImageSize);
        this.zoomedTolerance = this.tolerance / (this.calculateAbsoluteZoom() + 1);
        this.zoomedImageSize.displayWidth =
            this.zoomedImageSize.width + (this.internalPadding.width * 2);
        this.zoomedImageSize.displayHeight =
            this.zoomedImageSize.height + (this.internalPadding.height * 2);
    },

    /**
     * Precalculates the zoomed image size using the currently set zoom factor and the
     * specified rotation angle.
     * @param {Number} angle The angle to calculate the zoomed size for
     * @return {Object} The zoomed size for the specified angle; properties: width, height,
     *         displayWidth (width + padding; see {@link #internalPadding}), displayHeight
     *         (height + padding; see {@link #internalPadding})
     */
    precalculateRotatedSize: function(angle) {
        var basicImageSize = this.calculateBasicImageSizeForAngle(angle);
        var zoomedImageSize = this.calculateZoom(this.zoom, basicImageSize);
        zoomedImageSize.displayWidth =
            zoomedImageSize.width + (this.internalPadding.width * 2);
        zoomedImageSize.displayHeight =
            zoomedImageSize.height + (this.internalPadding.height * 2);
        return zoomedImageSize;
    },

    /**
     * <p>Calculates the size of the "spacer" image.</p>
     * <p>The spacer image reflects the overall size of the image in its current zoomed
     * state, but it covers at least the working area currently available. If no zoomed
     * image size is calculated (using {@link #propagateZoomedImageSize}, the working
     * area size is used instead.</p>
     * @return {Object} The spacer image's size; properties: width, height
     */
    calculateSpacerSize: function() {
        var width = this.workingAreaSize.width;
        var height = this.workingAreaSize.height;
        if (this.zoomedImageSize) {
            if (this.zoomedImageSize.displayWidth > width) {
                width = this.zoomedImageSize.displayWidth;
            }
            if (this.zoomedImageSize.height > height) {
                height = this.zoomedImageSize.displayHeight;
            }
        }
        return {
            "width": width,
            "height": height
        };
    },


    // Calculating coordinates -------------------------------------------------------------

    /**
     * <p>Calculates several coordinate views of the mouse pointer's current position.</p>
     * <p>The following coordinate views are available:</p>
     * <ol>
     * <li>"screen"- for the zoomed, rotated image (= what is actually seen on the screen)
     *     </li>
     * <li>"unzoomed" - for the unzoomed, but rotated image (= usually the coordinates
     *     that will be stored in the repository)</li>
     * <li>"unzoomedUnclipped" - for the unzoomed, but rotated image; contrary to
     *     "unzoomed", the coordinate may be outside the actual image</li>
     * <li>"original" - for the unzoomed, unrotated image</li>
     * </ul>
     * @private
     * @param {Event} event The mouse event
     * @return {Object} Views of the current position as described above
     */
    calculateTransformedCoords: function(event) {
        var compCoords = this.calcCompFromMouseCoords(event);
        // adjust to image offsets (if the image does not cover the whole working area at
        // the moment
        if (this.imageOffsets) {
            compCoords.x -= this.imageOffsets.x;
            compCoords.y -= this.imageOffsets.y;
        }
        // limit valid coordinates to zoomed image size only
        var maxX = this.zoomedImageSize.width;
        var maxY = this.zoomedImageSize.height;
        compCoords.isVirtual = (compCoords.x < 0) || (compCoords.x >= maxX)
            || (compCoords.y < 0) || (compCoords.y >= maxY);
        // CQ.Log.debug("CQ.form.ExtendedSmartImage.Image#onMouseMove: Coordinates (zoomed image): " + compCoords.x + "/" + compCoords.y);
        var absZoomFactor = this.calculateAbsoluteZoom();
        var unzoomedCoords = this.calculateInverseZoom(absZoomFactor, compCoords);
        var actualRotation = this.getActualRotation();
        var isVertical = (actualRotation == 90) || (actualRotation == 270);
        unzoomedCoords.zoom = this.zoom;
        unzoomedCoords.absoluteZoom = absZoomFactor;
        unzoomedCoords.imageSize = this.originalImageSize;
        unzoomedCoords.rotatedImageSize = {
            "width": (isVertical
                    ? this.originalImageSize.height : this.originalImageSize.width),
            "height": (isVertical
                    ? this.originalImageSize.width : this.originalImageSize.height)
        };
        var unzoomedUnclippedCoords = {
            "x": unzoomedCoords.x,
            "y": unzoomedCoords.y,
            "zoom": unzoomedCoords.zoom,
            "absoluteZoom": unzoomedCoords.absoluteZoom,
            "imageSize": unzoomedCoords.imageSize,
            "rotatedImageSize": unzoomedCoords.rotatedImageSize
        };
        // suppress rounding errors and do clipping
        if (unzoomedCoords.x < 0) {
            unzoomedCoords.x = 0;
        }
        if (unzoomedCoords.y < 0) {
            unzoomedCoords.y = 0;
        }
        if (isVertical) {
            if (unzoomedCoords.y >= this.originalImageSize.width) {
                unzoomedCoords.y = this.originalImageSize.width - 1;
            }
            if (unzoomedCoords.x >= this.originalImageSize.height) {
                unzoomedCoords.x = this.originalImageSize.height - 1;
            }
        } else {
            if (unzoomedCoords.x >= this.originalImageSize.width) {
                unzoomedCoords.x = this.originalImageSize.width - 1;
            }
            if (unzoomedCoords.y >= this.originalImageSize.height) {
                unzoomedCoords.y = this.originalImageSize.height - 1;
            }
        }
        // CQ.Log.debug("CQ.form.ExtendedSmartImage.Image#onMouseMove: Coordinates (unzoomed image): " + unzoomedCoords.x + "/" + unzoomedCoords.y);
        var unrotatedCoords;
        switch (actualRotation) {
             case 0:
                unrotatedCoords = {
                    "x": unzoomedCoords.x,
                    "y": unzoomedCoords.y
                };
                break;
            case 90:
                unrotatedCoords = {
                    "x": unzoomedCoords.y,
                    "y": this.originalImageSize.height - unzoomedCoords.x
                };
                break;
            case 180:
                unrotatedCoords = {
                    "x": this.originalImageSize.width - unzoomedCoords.x,
                    "y": this.originalImageSize.height - unzoomedCoords.y
                };
                break;
            case 270:
                unrotatedCoords = {
                    "x": this.originalImageSize.width - unzoomedCoords.y,
                    "y": unzoomedCoords.x
                };
                break;
        }
        // CQ.Log.debug("CQ.form.ExtendedSmartImage.Image#onMouseMove: Coordinates (unrotated image): " + unrotatedCoords.x + "/" + unrotatedCoords.y);
        return {
            "screen": compCoords,
            "unzoomed": unzoomedCoords,
            "unzoomedUnclipped": unzoomedUnclippedCoords,
            "unrotated": unrotatedCoords
        };
    },

    /**
     * <p>Calculate component relative coordinates from the mouse coordinates defined
     * by the specified event.</p>
     * @param {Event} event The event to calculate coordinates from
     * @return {Object} Object with relative coordinates; properties: x, y
     */
    calcCompFromMouseCoords: function(event) {
        var compCoords = new Object();
        // calculare coordinates
        var coords = CQ.Ext.get(this.canvasDiv).getXY();
        var canvasOffset = {
            hOffset: coords[0],
            vOffset: coords[1]
        };
        compCoords.x = event.getPageX();
        compCoords.y = event.getPageY();
        compCoords.x -= canvasOffset.hOffset;
        compCoords.y -= canvasOffset.vOffset;
        // respect scroll offsets
        compCoords.x += this.scrollerDiv.scrollLeft;
        compCoords.y += this.scrollerDiv.scrollTop;
        event.preventDefault();
        // consider internal padding if applicable
        if (this.scrollerDiv.clientWidth < this.scrollerDiv.scrollWidth) {
            compCoords.x -= this.internalPadding.width;
        }
        if (this.scrollerDiv.clientHeight < this.scrollerDiv.scrollHeight) {
            compCoords.y -= this.internalPadding.height;
        }
        return compCoords;
    },


    // Propagation stuff (model to view) ---------------------------------------------------

    /**
     * Propagates the current image state to the view.
     * @private
     */
    propagateImage: function() {
        this.blockRedraw = true;
        this.calculateInternalOffset();
        // adjust scrollbars to new situation
        var availWidth = this.workingAreaSize.width;
        var availHeight = this.workingAreaSize.height;
        var imgWidth = this.zoomedImageSize.displayWidth;
        var imgHeight = this.zoomedImageSize.displayHeight;
        if ((this.internalOffset.x + availWidth) > imgWidth) {
            this.internalOffset.x = imgWidth - availWidth;
        }
        if ((this.internalOffset.y + availHeight) > imgHeight) {
            this.internalOffset.y = imgHeight - availHeight;
        }
        if (this.internalOffset.x < 0) {
            this.internalOffset.x = 0;
        } else if (this.internalOffset.y < 0) {
            this.internalOffset.y = 0;
        }
        var isScrollX = (this.internalOffset.x != this.scrollerDiv.scrollLeft);
        var isScrollY = (this.internalOffset.y != this.scrollerDiv.scrollTop);
        if  (isScrollY) {
            this.scrollerDiv.scrollTop = this.internalOffset.y;
        }
        if  (isScrollX) {
            this.scrollerDiv.scrollLeft = this.internalOffset.x;
        }
        this.drawImage();
        this.blockRedraw = false;
    },

    /**
     * <p>Propagates the current state of the working area's data model to the view.</p>
     * <p>Note that this method has an asynchronous part due to browser limitations, so
     * the caller should pass in the code that should be executed after the method has
     * been completed as a callback function rather than continue directly.</p>
     * @param {Function} callback The function to be called after the working area's view
     *        has been adjusted completely
     * @private
     */
    propagateWorkingArea: function(callback) {
        this.setCSSSize(this.positioningContainer, this.basicSize);
        this.setCSSSize(this.scrollerDiv, this.basicSize);
        var fn = this.propagateWorkingAreaAsync.createDelegate(this, [ callback ]);
        fn.defer(1);
    },

    /**
     * This is the asynchronous part of {@link #propagateWorkingArea}. This is required
     * as a workaround to give the browser the time required to adjust internally to some
     * changes made earlier.
     * @param {Function} callback The function to be called after the working area's view
     *        has been adjusted completely
     * @private
     */
    propagateWorkingAreaAsync: function(callback) {
        this.calculateWorkingAreaSize();
        this.adjustSpacerImage();
        this.setCanvasSize(this.imageCanvas, this.workingAreaSize);
        if (callback) {
            callback();
        }
    },


    // Zooming -----------------------------------------------------------------------------

    /**
     * <p>Sets the current zoom factor.</p>
     * <p>The change is propagated to the view appropriately.</p>
     * @param {Number} zoom New zoom factor (where 0 means unzoomed, 0.1 will scale up to
     *        1.1-times the basic size, and so on)
     */
    setZoom: function(zoom) {
        this.calculateCenterPoint();
        this.zoom = zoom;
        this.calculateZoomedImageSize();
        this.adjustSpacerImage();
        this.propagateImage();
    },

    /**
     * <p>Calculates the center point of the current working area to the model
     * (@link #centerPoint).</p>
     * <p>The center point is used for focusing when zooming.</p>
     * @private
     */
    calculateCenterPoint: function() {
        var availWidth = this.workingAreaSize.width;
        var availHeight = this.workingAreaSize.height;
        var scrollX = this.scrollerDiv.scrollLeft;
        var scrollY = this.scrollerDiv.scrollTop;
        var zoomedCenterPoint = {
            "x": scrollX + (availWidth / 2) - this.internalPadding.width,
            "y": scrollY + (availHeight / 2) - this.internalPadding.height
        };
        if (zoomedCenterPoint.x < 0) {
            zoomedCenterPoint = 0;
        }
        if (zoomedCenterPoint.y < 0) {
            zoomedCenterPoint = 0;
        }
        var zoom = this.calculateAbsoluteZoom();
        this.centerPoint = this.calculateInverseZoom(zoom, zoomedCenterPoint);
    },

    /**
     * <p>Calculates the internal offset for displaying the current image fragment
     * (see @link #internalOffset}), considering the current center point (if one is
     * set).</p>
     * <p>The internal offset is also used for correctly setting the scrollbar offsets.</p>
     * @private
     */
    calculateInternalOffset: function() {
        var availWidth = this.workingAreaSize.width;
        var availHeight = this.workingAreaSize.height;
        if (this.centerPoint) {
            var absZoom = this.calculateAbsoluteZoom();
            var zoomedOffsets = this.calculateZoom(absZoom, this.centerPoint);
            var scrollX = Math.round(
                    zoomedOffsets.x + this.internalPadding.width - (availWidth / 2));
            var scrollY = Math.round(
                    zoomedOffsets.y + this.internalPadding.height - (availHeight / 2));
            if (scrollX < 0) {
                scrollX = 0;
            }
            if (scrollY < 0) {
                scrollY = 0;
            }
            this.internalOffset.x = scrollX;
            this.internalOffset.y = scrollY;
        } else {
            this.internalOffset.x = 0;
            this.internalOffset.y = 0;
        }
    },

    /**
     * <p>Handler for scrolling.</p>
     * <p>A new appropriate center point is calculated and a suitable image fragment is
     * displayed.</p>
     * @private
     */
    handleScroll: function() {
        if (!this.blockRedraw) {
            var scrollX = this.scrollerDiv.scrollLeft;
            var scrollY = this.scrollerDiv.scrollTop;
            var isChanged =
                (this.internalOffset.x != scrollX) || (this.internalOffset.y != scrollY);
            if (isChanged) {
                this.internalOffset.x = scrollX;
                this.internalOffset.y = scrollY;
                this.calculateCenterPoint();
                this.drawImage();
            }
        }
    },


    // Rotation ----------------------------------------------------------------------------

    /**
     * <p>Sets the current rotation.</p>
     * <p>The change is propagated to the view appropriately.</p>
     * @param {Number} rotation New rotation (in degrees; only values of 0, 90, 180, 270 are
     *        allowed)
     */
    setRotation: function(rotation) {
        this.calculateCenterPoint();
        this.rotation = rotation;
        this.calculateBasicImageSize();
        this.calculateZoomedImageSize();
        this.adjustSpacerImage();
        this.propagateImage();
    },

    /**
     * Gets the actual rotation (considering the {@link #ignoreRotation} setting).
     * @return {Number} The actual rotation (0, 90, 180, 270)
     */
    getActualRotation: function() {
        return (this.ignoreRotation ? 0 : this.rotation);
    },


    // Helpers -----------------------------------------------------------------------------

    /**
     * <p>Sets the size of an image.</p>
     * <p>The size is set through the width and height DOM attributes and the correspondent
     * CSS attributes to avoid compatibility problems with surrounding CSS classes.</p>
     * @param {Image} img The image
     * @param {Object} size The size to set; properties: width, height
     * @private
     */
    setImageSize: function(img, size) {
        img.width = size.width;
        img.height = size.height;
        img.style.width = size.width + "px";
        img.style.height = size.height + "px";
    },

    /**
     * Sets the size of a DOM object using the corresponding CSS attributes.
     * @param {HTMLElement} dom The DOM object
     * @param {Object} size The size to set; properties: width, height
     * @private
     */
    setCSSSize: function(dom, size) {
        dom.style.width = size.width + "px";
        dom.style.height = size.height + "px";
    },

    /**
     * <p>Sets the size of the canvas.</p>
     * <p>This is done using the width and height DOM attributes.</p>
     * @param {HTMLElement} dom The canvas DOM object
     * @param {Object} size The size to set; properties: width, height
     */
    setCanvasSize: function(dom, size) {
        dom.width = size.width;
        dom.height = size.height;
    },

    /**
     * Calculates the distance between the two coordinates specified.
     * @param {Object} coord1 First coordinates; properties: x, y
     * @param {Object} coord2 Second coordinates; properties: x, y
     * @return {Number} The distance between the two coordinates
     */
    calculateDistance: function(coord1, coord2) {
        return Math.sqrt(Math.pow(coord1.x - coord2.x, 2)
                + Math.pow(coord1.y - coord2.y, 2));
    },

    /**
     * Handles all calculation &amp; propagation stuff when a new image has finished
     * loading.
     */
    handleImageLoaded: function() {
        this.zoom = 0;
        this.internalOffset.x = 0;
        this.internalOffset.y = 0;
        this.centerPoint = null;
        this.calculateOriginalImageSize();
        if (this.isInitialized) {
            this.calculateBasicImageSize();
            this.calculateZoomedImageSize();
            this.adjustSpacerImage();
            this.propagateImage();
        }
    },

    /**
     * <p>Adjusts the size of the spacer image that determines the extension of the
     * scrollbars.</p>
     * <p>This method must be called whenever the zoomed size of the image changes.</p>
     */
    adjustSpacerImage: function() {
        this.setImageSize(this.spacerImage, this.calculateSpacerSize());
    },


    // Shape sets --------------------------------------------------------------------------

    /**
     * <p>Adds a shape set.</p>
     * <p>The view will be adjusted accordingly.</p>
     * @param {CQ.form.ExtendedSmartImage.ShapeSet} setToAdd shape set to add
     */
    addShapeSet: function(setToAdd) {
        this.shapeSets[setToAdd.id] = setToAdd;
        setToAdd.imageComponent = this;
        var shapeCnt = setToAdd.getShapeCount();
        for (var shapeIndex = 0; shapeIndex < shapeCnt; shapeIndex++) {
            this.addShapeToDOM(setToAdd.getShapeAt(shapeIndex));
        }
        if (setToAdd.isVisible) {
            this.drawImage();
        }
    },

    /**
     * Draws all currently visible shape sets.
     * @param {CanvasRenderingContext2D} ctx The canvas context
     * @param {Object} offsets offsets; properties: srcX, srcY, destX, destY, imageSize,
     *        zoomedSize - todo document these properties!
     */
    drawShapeSets: function(ctx, offsets) {
        var absoluteZoom = this.calculateAbsoluteZoom() + 1;
        for (var setId in this.shapeSets) {
            if (this.shapeSets.hasOwnProperty(setId)) {
                var setToDraw = this.shapeSets[setId];
                if (setToDraw.isVisible) {
                    setToDraw.drawShapes(ctx, absoluteZoom, offsets);
                }
            }
        }
    },

    /**
     * Executes the specified function for each shape in each shapeset.
     * @param {Function} fnToExecute The function to execute
     * @param {Boolean} visibleOnly True if the function should only be executed on visible
     *        shape sets
     */
    executeFnOnShapes: function(fnToExecute, visibleOnly) {
        for (var setId in this.shapeSets) {
            if (this.shapeSets.hasOwnProperty(setId)) {
                var setToExecute = this.shapeSets[setId];
                if (setToExecute.isVisible || !visibleOnly) {
                    setToExecute.executeFnOnShapes(fnToExecute);
                }
            }
        }
    },

    /**
     * Gets a shape set from its ID.
     * @param {String} shapeSetId ID of the shape set
     * @return {CQ.form.ExtendedSmartImage.ShapeSet} The shape set; null if no shape set is defined
     *         for the specified ID
     */
    getShapeSet: function(shapeSetId) {
        if (this.shapeSets.hasOwnProperty(shapeSetId)) {
            return this.shapeSets[shapeSetId];
        }
        return null;
    },

    /**
     * Gets the shape set that contains the specified shape
     * @param {CQ.form.ExtendedSmartImage.Shape} shape The shape for which the containing shape set
     *         should be retrieved
     * @return {CQ.form.ExtendedSmartImage.ShapeSet} The shape set that is containing the specified
     *         shape; null if no suitable shape set has been found
     */
    getSuitableShapeSet: function(shape) {
        for (var shapeSetToCheck in this.shapeSets) {
            if (this.shapeSets.hasOwnProperty(shapeSetToCheck)) {
                var shapeSet = this.shapeSets[shapeSetToCheck];
                var shapeCnt = shapeSet.getShapeCount();
                for (var shapeIndex = 0; shapeIndex < shapeCnt; shapeIndex++) {
                    var shapeToCheck = shapeSet.getShapeAt(shapeIndex);
                    if (shapeToCheck == shape) {
                        return shapeSet;
                    }
                }
            }
        }
        return null;
    },

    /**
     * <p>Sets the visibility of a shape set as a whole.</p>
     * <p>Internal onUnselect/onRollOut events are sent accordingly. No system events are
     * fired.</p>
     * <p>Note that this setting affects the shape set as a whole. If a shape set that
     * contains hidden shapes is shown using this method, these hidden shapes are still
     * hidden.</p>
     * @param {String} shapeSetId ID of shape set
     * @param {Boolean} isVisible True if the shape set has to be made visible
     * @param {Boolean} requestRedraw True if a redraw should be issued
     */
    setShapeSetVisible: function(shapeSetId, isVisible, requestRedraw) {
        var shapeSet = this.shapeSets[shapeSetId];
        if (shapeSet) {
            shapeSet.executeFnOnShapes(function(shape) {
                // fire rollover/selection events on hide
                if (!isVisible) {
                    var isRollover = (this.rolledOverShapes.indexOf(shape) >= 0);
                    var selectedIndex = (this.selectedShapes.indexOf(shape) >= 0);
                    if (isRollover) {
                        this.removeShapeFromRollovers(shape, null, true);
                    }
                    if (selectedIndex >= 0) {
                        shape.onUnSelect();
                        this.selectedShapes.splice(selectedIndex, 1);
                    }
                }
            }.createDelegate(this), true);
            shapeSet.setVisible(isVisible);
            if (requestRedraw) {
                this.drawImage();
            }
        }
        // todo it's probably a bug that no system events are fired here!
    },

    /**
     * <p>Hides all currently visible shape sets.</p>
     * <p>Internal onUnselect/onRollOut events are sent accordingly. No system events are
     * fired.</p>
     * <p>Note that this setting affects each shape set as a whole. If a shape set that
     * contains hidden shapes is shown using this method, these hidden shapes are still
     * hidden.</p>
     * @param {Boolean} requestRedraw True if a redraw should be issued
     */
    hideAllShapeSets: function(requestRedraw) {
        for (var shapeSetId in this.shapeSets) {
            var shapeSetToHide = this.shapeSets[shapeSetId];
            if (shapeSetToHide.isVisible) {
                this.setShapeSetVisible(shapeSetId, false, false);
            }
        }
        if (requestRedraw) {
            this.drawImage();
        }
    },

    /**
     * <p>Schedules a shape for dragging.</p>
     * <p>Should only be used when progessing the "add request" event.</p>
     * @param {CQ.form.ExtendedSmartImage.Shape} shapeToSchedule The shape to schedule
     */
    scheduleForDragging: function(shapeToSchedule) {
        this.scheduledDragShapes.push(shapeToSchedule);
    },


    // Canvas implementation and abstraction -----------------------------------------------

    /**
     * <p>Creates a canvas DOM object that is suitable for the current browser.</p>
     * <p>The size is taken from properties width/height (compliant browsers) resp.
     * displayWidth/displayHeight (Internet Explorer).</p>
     * @param {HTMLElement} parentDom The DOM element the canvas will be appended to
     * @return {CQ.Ext.Element} A suitable Canvas Ext-Element
     */
    createCanvas: function(parentDom, width, height) {
        var theCanvas;
        CQ.Log.debug("SmartImage.Image#createCanvas: Started.");
        // the Ext way of creating elements doesn't work here
        theCanvas = document.createElement("canvas");
        parentDom.appendChild(theCanvas);
        if (theCanvas) {
            if (width) {
                theCanvas.width = width;
            }
            if (height) {
                theCanvas.height = height;
            }
            if (CQ.Ext.isIE) {
                try {
                    theCanvas = G_vmlCanvasManager.initElement(theCanvas);
                } catch (e) {
                    theCanvas = null;
                }
                if (!theCanvas) {
                    CQ.Log.fatal("SmartImage.Image#createCanvas: Could not create Canvas emulation for Internet Explorer.");
                }
            }
        }
        CQ.Log.debug("SmartImage.Image#createCanvas:Finished; creating canvas " + (theCanvas ? "was successful" : "failed") + ".");
        return theCanvas;
    },

    disablePanelTemporaryily: function() {
        if (!this.workingAreaSize && this.scrollerDiv) {
            this.calculateWorkingAreaSize();
        }
        if (this.imageCanvas && this.workingAreaSize) {
            var ctx = this.imageCanvas.getContext("2d");
            ctx.save();
            ctx.globalCompositeOperation = "source-over";
            var availWidth = this.workingAreaSize.width;
            var availHeight = this.workingAreaSize.height;
            if (CQ.Ext.isIE) {
                ctx.clearRect();
            } else {
                ctx.clearRect(0, 0, availWidth, availHeight);
            }
            ctx.restore();
        }
    },

    /**
     * Draws the current image fragment, considering all settings.
     */
    drawImage: function() {
        var actualRotation = this.getActualRotation();
        // todo probably using trigonometry here would make this more maintainable
        var ctx = this.imageCanvas.getContext("2d");
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        var availWidth = this.workingAreaSize.width;
        var availHeight = this.workingAreaSize.height;
        // translate canvas to its center and rotate it
        var transX = Math.floor(availWidth / 2);
        var transY = Math.floor(availHeight / 2);
        ctx.translate(transX, transY);
        ctx.rotate((actualRotation * Math.PI) / 180);
        // calculate offsets in destination image
        var xOffs = 0, yOffs = 0;
        var padXStart = 0, padXEnd = 0;
        var padYStart = 0, padYEnd = 0;
        var displayWidth = availWidth;
        var xOffsImgEnd = this.zoomedImageSize.displayWidth
                - availWidth - this.internalPadding.width;
        var yOffsImgEnd = this.zoomedImageSize.displayHeight
                - availHeight - this.internalPadding.height;
        if (availWidth >= this.zoomedImageSize.displayWidth) {
            displayWidth = this.zoomedImageSize.width;
            xOffs = Math.round((availWidth - displayWidth) / 2);
        } else {
            padXStart = (this.internalOffset.x < this.internalPadding.width
                    ? this.internalPadding.width - this.internalOffset.x : 0);
            if (this.internalOffset.x > xOffsImgEnd) {
                padXEnd = this.internalOffset.x - xOffsImgEnd;
            }
            displayWidth -= padXStart + padXEnd;
        }
        var displayHeight = availHeight;
        if (availHeight >= this.zoomedImageSize.displayHeight) {
            displayHeight = this.zoomedImageSize.height;
            yOffs = Math.round((availHeight - displayHeight) / 2);
        } else {
            padYStart = (this.internalOffset.y < this.internalPadding.height
                    ? this.internalPadding.height - this.internalOffset.y : 0);
            if (this.internalOffset.y > yOffsImgEnd) {
                padYEnd = this.internalOffset.y - yOffsImgEnd;
            }
            displayHeight -= padYStart + padYEnd;
        }
        /*
        CQ.Log.debug("Avail: " + availWidth + "/" + availHeight);
        CQ.Log.debug("Display: " + xOffs + "/" + yOffs + " --- " + displayWidth + "/" + displayHeight);
        CQ.Log.debug("Padding: XS:" + padXStart + " XE:" + padXEnd + " YS:" + padYStart + " YE:" + padYEnd);
        */
        this.imageOffsets = {
            "x": xOffs,
            "y": yOffs
        };
        var x0 = -transX;
        var y0 = -transY;
        // determine if the image is vertical (90/270 deg rotation)
        var isVertical = (actualRotation == 90) || (actualRotation == 270);
        // clear background
        if (CQ.Ext.isIE) {
            // clear everything
            ctx.clearRect();
        } else {
            if (isVertical) {
                ctx.clearRect(y0, x0, availHeight, availWidth);
            } else {
                ctx.clearRect(x0, y0, availWidth, availHeight);
            }
        }
        // calculate original, unzoomed source sizes and positions
        var sourcePos = {
            "x": 0,
            "y": 0
        };
        var sourceZoom = this.calculateAbsoluteZoom();
        var posCalc = {
            "x": this.internalOffset.x - this.internalPadding.width,
            "y": this.internalOffset.y - this.internalPadding.height
        };
        if (posCalc.x < 0) {
            posCalc.x = 0;
        }
        if (posCalc.y < 0) {
            posCalc.y = 0;
        }
        var shapeSourcePos = this.calculateInverseZoom(sourceZoom, posCalc);
        switch (actualRotation) {
            case 90:
                posCalc.x = this.zoomedImageSize.width - posCalc.x - displayWidth;
                break;
            case 180:
                posCalc.x = this.zoomedImageSize.width - posCalc.x - displayWidth;
                posCalc.y = this.zoomedImageSize.height - posCalc.y - displayHeight;
                break;
            case 270:
                posCalc.y = this.zoomedImageSize.height - posCalc.y - displayHeight;
                break;
        }
        sourcePos = this.calculateInverseZoom(sourceZoom, posCalc);
        var sourceSize = this.calculateInverseZoom(sourceZoom, {
                "width": displayWidth,
                "height": displayHeight
            });
        // respect rotation, as the original image is unrotated, while coordinate
        // calculation so far has run on rotated coordinates
        var srcX = (isVertical ? sourcePos.y : sourcePos.x);
        var srcY = (isVertical ? sourcePos.x : sourcePos.y);
        if (srcX < 0) {
            srcX = 0;
        }
        if (srcY < 0) {
            srcY = 0;
        }
        var srcWidth = (isVertical ? sourceSize.height : sourceSize.width);
        var srcHeight = (isVertical ? sourceSize.width : sourceSize.height);
        if (srcWidth > this.originalImageSize.width) {
            srcWidth = this.originalImageSize.width;
        }
        if (srcHeight > this.originalImageSize.height) {
            srcHeight = this.originalImageSize.height;
        }
        // convert destination coordinates
        var destX, destY, destWidth, destHeight;
        switch (actualRotation) {
            case 0:
                destX = x0 + xOffs + padXStart;
                destY = y0 + yOffs + padYStart;
                destWidth = displayWidth;
                destHeight = displayHeight;
                break;
            case 90:
                destX = y0 + yOffs + padYStart;
                destY = x0 + xOffs + padXEnd;
                destWidth = displayHeight;
                destHeight = displayWidth;
                break;
            case 180:
                destX = x0 + xOffs + padXEnd;
                destY = y0 + yOffs + padYEnd;
                destWidth = displayWidth;
                destHeight = displayHeight;
                break;
            case 270:
                destX = y0 + yOffs + padYEnd;
                destY = x0 + xOffs + padXStart;
                destWidth = displayHeight;
                destHeight = displayWidth;
                break;
        }
        // draw
        var isException = false;
        try {
            ctx.drawImage(this.imageToDisplay.image,
                    srcX, srcY, srcWidth, srcHeight, destX, destY, destWidth, destHeight);
        } catch (e) {
            window.setTimeout(this.drawImage.createDelegate(this), 1);
            isException = true;
        }
        ctx.restore();
        if (!isException) {
            // draw shapes
            this.drawShapeSets(ctx, {
                "destX": xOffs + padXStart,
                "destY": yOffs + padYStart,
                "srcX": shapeSourcePos.x,
                "srcY": shapeSourcePos.y,
                "imageSize": this.originalImageSize,
                "zoomedSize": this.zoomedImageSize
            });
        }
    },

    /**
     * <p>Creates the additional DOM objects for the specified
     * {@link CQ.form.ExtendedSmatrImage.Shape} which are required for accelerating display speed
     * on Internet Explorer.</p>
     * <p>The method will do nothing if invoked for other browsers.</p>
     * @param {CQ.form.ExtendedSmartImage.Shape} shape The shape for which the additional DOM
     *        objects should be created
     */
    addShapeToDOM: function(shape) {
        if (CQ.Ext.isIE) {
            var container = CQ.Ext.DomHelper.insertBefore(this.scrollerDiv, {
                tag: "div"
            }, false);
            container.style.position = "absolute";
            container.style.top = "0";
            container.style.left = "0";
            var canvas = this.createCanvas(
                    container, this.workingAreaSize.width, this.workingAreaSize.height);
            var shapeDef = {
                "container": container,
                "canvas": canvas,
                "shape": shape
            };
            if (!this.shapeDefs) {
                this.shapeDefs = new Array();
            }
            this.shapeDefs.push(shapeDef);
            shape.shapeDef = shapeDef;
        }
    },

    /**
     * <p>Removes the IE specific DOM objects that were added by {@link #addShapeToDom}
     * for the specified {@link CQ.form.ExtendedSmartImage.Shape}.</p>
     * <p>The method will do nothing if invoked for other browsers.</p>
     * @param {CQ.form.ExtendedSmartImage.Shape} shape The shape for which additional DOM objects
     *        will be removed
     */
    removeShapeFromDOM: function(shape) {
        if (CQ.Ext.isIE) {
            var shapeDef = shape.shapeDef;
            var canvasElement = CQ.Ext.get(shapeDef.canvas);
            var divElement = CQ.Ext.get(shapeDef.container);
            canvasElement.remove();
            divElement.remove();
        }
    },

    /**
     * <p>Gets a canvas context for directly accessing the basic image.</p>
     * <p>This should only be used for animation purposes.</p>
     * @return {CanvasRenderingContext2D} Canvas context for directly accessing the basic
     *         image
     */
    getCanvasContext: function() {
        return this.imageCanvas.getContext("2d");
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

// Interface -------------------------------------------------------------------------------

/**
 * @class CQ.form.ExtendedSmartImage.ExtendedTool
 * @private
 * The SmartImage.Tool must be extended by all tools that
 * are available for the SmartImage component.
 */
CQ.form.ExtendedSmartImage.ExtendedTool = CQ.Ext.extend(CQ.Ext.emptyFn, {

    /**
     * @cfg {String} toolId
     * Unique identifier for the tool
     */
    toolId: null,

    /**
     * @cfg {String} toolName
     * The tool's human readable name
     */
    toolName: null,

    /**
     * @cfg {String} transferFieldName
     * Name of the form field used for transfering tool-related data
     */
    transferFieldName: null,

    /**
     * Form field used for transfering tool-related data
     * @private
     * @type CQ.Ext.form.Hidden
     * @see #transferFieldName
     */
    transferField: null,

    /**
     * @cfg {Boolean} isCommandTool
     * Determines if the tool is a "command tool", which is executing a singular action
     * "on click" rather than providing its own interface and changing the edit mode
     */
    isCommandTool: false,

    /**
     * User interface for the tool
     * @private
     * @type CQ.form.ExtendedSmartImage.ExtendedTool.UserInterface
     */
    userInterface: null,

    /**
     * The ExtendedSmartImage component the tool is used in
     * @private
     * @type CQ.form.ExtendedSmartImage
     */
    imageComponent: null,

    /**
     * The button that represents the tool in the toolbar.
     * @private
     * @type CQ.Ext.Button
     */
    buttonComponent: null,


    constructor: function(config) {
        config = config || { };
        CQ.Ext.apply(this, config);
    },

    /**
     * <p>Initializes the tool.</p>
     * <p>This method may be overridden by implementing tools. It is only called once,
     * soon after the tool has been instantiated.</p>
     * <p>While the constructor method gets the tool's config, initialize gets notified
     * about the {@link CQ.form.ExtendedSmartImage}'s config and may adapt to any tool-specific
     * component configuration provided by the parent component.</p>
     * @param {Object} config dialog configuration
     */
    initialize: function(config) {
        // may be overridden
    },

    /**
     * <p>Initializes the tool's components.</p>
     * <p>This method may be overridden by implementing tools. It is called in the
     * {@link CQ.form.ExtendedSmartImage#initComponent} method (hence after {@link #initialize} and
     * notifies the implementing method about the parent image component.</p>
     * @param {CQ.form.ExtendedSmartImage} imageComponent The parent image component
     */
    initComponent: function(imageComponent) {
        this.imageComponent = imageComponent;
    },

    /**
     * <p>This method is called when the tool is activated through the user interface.</p>
     * <p>Activation events are only sent for non-command tools (this.isCommandTool ==
     * false).</p>
     * <p>The method may be overriden by the specific tool, but this base method should
     * be called from the overriding method. Note that you don't have to show the user
     * interface explicitly, as this is handled by the calling {@link CQ.form.ExtendedSmartImage}
     * component itself.</p>
     */
    onActivation: function() {
        // may be overridden
    },

    /**
     * <p>This method is called when the tool is deactivated.</p>
     * <p>Deactivation events are only sent for non-command tools (this.isCommandTool ==
     * false).</p>
     * <p>The method may be overriden by the specific tool, but this base method should
     * be called from the overriding method. Note that you don't have to hide the user
     * interface explicitly, as this is handled by the calling {@link CQ.form.ExtendedSmartImage}
     * component itself.</p>
     */
    onDeactivation: function() {
        // may be overriden
    },

    /**
     * <p>This method is called when the tool is clicked.</p>
     * <p>Command-related events are only sent for command-based tools (this.isCommandTool
     * == true<).</p>
     */
    onCommand: function() {
        // may be overridden
    },

    /**
     * <p>This method is called when a new image is uploaded (or referenced).</p>
     * @param {CQ.form.ExtendedSmartImage.Image} image The (original) image uploaded or referenced;
      *       no zooming, rotation, etc. applied
     */
    onImageUploaded: function(image) {
        // may be overriden
    },

    /**
     * <p>This method is called when the image gets flushed.</p>
     * <p>The default implementation clears the tool's data by resetting its transfer field.
     * Tools may/should override this method, for example if they don't use a transfer field
     * or multiple fields.</p>
     */
    onImageFlushed: function() {
        this.resetToolValue();
    },


    // Serialization/Deserialization -------------------------------------------------------

    /**
     * <p>Creates the transfer field for the serialized value.</p>
     * <p>May be overridden by implementing classes if required.</p>
     * @param {CQ.Ext.Panel} parent The parent panel
     */
    createTransferField: function(parent) {
        this.transferField = new CQ.Ext.form.Hidden({
            "name": this.transferFieldName
        });
        parent.add(this.transferField);
    },

    /**
     * Serializes the tool's content and writes it to the transfer field.
     */
    transferToField: function() {
        var serializedValue = this.serialize();
        if (serializedValue == null) {
            serializedValue = this.initialValue;
        }
        this.transferField.setValue(serializedValue);
    },

    /**
     * <p>Resets the tool's current content.</p>
     * <p>This method should usually be called by the tool's {@link #onImageFlushed} method
     * if the tool's settings/contents/value has to be cleared after an image has been
     * flushed.</p>
     */
    resetToolValue: function() {
        this.transferField.setValue("");
    },

    /**
     * Deserializes the tool's content from the given data record.
     * @param {CQ.data.SlingRecord} record The record to deserialize from
     */
    processRecord: function(record) {
        this.initialValue = record.get(this.transferFieldName);
        if (this.initialValue == null) {
            this.initialValue = "";
        }
    },

    /**
     * <p>In this method the tool has to provide a serialized representation of its current
     * state.</p>
     * @return {String} The serialized representation of its current state
     */
    serialize: function() {
        // must be overriden
        return null;
    },

    /**
     * In this method the tool has to adapt its internal state to the given serialized
     * representation (as created by the corresponding {@link #serialize} method).
     * @param {String} str The serialized the serialized representation that has to be
     *        deserialized
     */
    deserialize: function(str) {
        // must be overriden
    },

    /**
     * <p>Checks if the tool is currently avaialble due to the state of the image.</p>
     * <p>Overriding this allows the tool to react on several corner cases, for example
     * to disable itself if no processed version is available.</p>
     * <p>Note that the tool doesn't have to react on "common" state issues (such as a
     * locked live copy), as this is handled on the {@link CQ.form.ExtendedSmartImage} component.
     * </p>
     */
    isEnabled: function() {
        return true;
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
 * @class CQ.form.ExtendedSmartImage.ExtendedTool.Rotate
 * @private
 * The SmartImage.Tool.Rotate provides the "Rotate" feature
 * for the SmartImage component.
 * @constructor
 * Creates a new SmartImage.Tool.Rotate.
 * @param {String} transferFieldName Name of field to be used for transfering data
 */
CQ.form.ExtendedSmartImage.ExtendedTool.Rotate = CQ.Ext.extend(CQ.form.ExtendedSmartImage.ExtendedTool, {

    /**
     * Angle (in degrees) the image has already been rotated by the server.
     * @private
     * @type Number
     */
    preRotation: 0,

    constructor: function(transferFieldName) {
        CQ.form.ExtendedSmartImage.ExtendedTool.Rotate.superclass.constructor.call(this, {
            "toolId": "smartimageRotate",
            "toolName": CQ.I18n.getMessage("Rotate"),
            "iconCls": "cq-image-icon-rotate",
            "isCommandTool": true,
            "userInterface": null,
            "transferFieldName": transferFieldName
        });
    },

    /**
     * Handler that executes the rotate command when the user clicks on the tool's button.
     */
    onCommand: function() {
        var imagePanel = this.imageComponent.getImagePanel();
        var animation = new CQ.form.ExtendedSmartImage.Animation({
            "imageComponent": this.imageComponent,
            "onFinished": this.executeRotate.createDelegate(this)
        });
        var durationMs = 0;
        if (imagePanel.zoom > 0) {
            durationMs = 200;
            animation.addStep(new CQ.form.ExtendedSmartImage.Animation.ZoomOut({
                "durationMs": 300,
                "startZoom": imagePanel.zoom,
                "endZoom": 0.0
            }));
        }
        animation.addStep(new CQ.form.ExtendedSmartImage.Animation.ExecuteFn({
            "durationMs": durationMs,
            "fn": function() {
                imagePanel.switchToDefaultView();
                var startAngle = imagePanel.rotation;
                var isStartVertical = (startAngle == 90) || (startAngle == 270);
                var startSize = {
                    "width": (isStartVertical
                            ? imagePanel.zoomedImageSize.height
                            : imagePanel.zoomedImageSize.width),
                    "height": (isStartVertical
                            ? imagePanel.zoomedImageSize.width
                            : imagePanel.zoomedImageSize.height)
                };
                var endAngle = startAngle + 90;
                var endSize = imagePanel.precalculateRotatedSize(endAngle);
                var isEndVertical = (endAngle == 90) || (endAngle == 270);
                if (isEndVertical) {
                    var temp = endSize;
                    endSize = {
                        "width": temp.height,
                        "height": temp.width
                    };
                }
                var theImage = imagePanel.imageToDisplay;
                animation.addStep(new CQ.form.ExtendedSmartImage.Animation.Rotation({
                    "image": theImage,
                    "durationMs": 300,
                    "startAngle": startAngle,
                    "endAngle": startAngle + 90,
                    "startSize": startSize,
                    "endSize": endSize
                }));
            }
        }));
        animation.play();
    },

    /**
     * Executes the actual rotation when the rotation animation has finished.
     */
    executeRotate: function() {
        var imagePanel = this.imageComponent.getImagePanel();
        imagePanel.setRotation(Math.round(imagePanel.rotation + 90) % 360);
        var changeDef = {
            "changeType": "rotate",
            "newValue": imagePanel.rotation,
            "valueDelta": 90
        };
        imagePanel.fireEvent("contentchange", changeDef);
        imagePanel.fireEvent("smartimage.contentchange", changeDef); // deprecated as of 5.3
    },

    /**
     * Handler that resets the rotate parameter when flushing an image.
     */
    onImageFlushed: function() {
        var imagePanel = this.imageComponent.getImagePanel();
        imagePanel.setRotation(0);
        this.preRotation = 0;
        CQ.form.ExtendedSmartImage.ExtendedTool.Rotate.superclass.onImageFlushed.call(this);
    },

    /**
     * Parses the rotation parameter from the given Record.
     * @param {CQ.data.SlingRecord} record Record to parse
     */
    processRecord: function(record) {
        CQ.form.ExtendedSmartImage.ExtendedTool.Rotate.superclass.processRecord.call(this, record);
        this.deserialize(this.initialValue);
    },

    /**
     * Serializes the rotation parameter.
     */
    serialize: function() {
        var imagePanel = this.imageComponent.getImagePanel();
        return (Math.round(imagePanel.rotation) + this.preRotation) % 360;
    },

    /**
     * Deserializes the rotation parameter from the given string representation.
     * @param {String} stringRep The string representation
     */
    deserialize: function(stringRep) {
        var imagePanel = this.imageComponent.getImagePanel();
        if (stringRep && (stringRep.length > 0)) {
            var rotation = 0;
            try {
                rotation = parseInt(stringRep);
            } catch (e) {
                // handled by default value
            }
            this.preRotation = rotation;
        } else {
            this.preRotation = 0;
        }
        imagePanel.rotation = 0;
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
 * @class CQ.form.ExtendedSmartImage.ExtendedTool.UserInterface
 * @extends CQ.Ext.Panel
 * @private
 * The SmartImage.Tool.UserInterface must be extended by all
 * classes that provide external UI (usually in the form of a floating toolbar) for
 * a SmartImage tool.
 * @constructor
 * @param {Object} config The config
 */
CQ.form.ExtendedSmartImage.ExtendedTool.UserInterface = CQ.Ext.extend(CQ.Ext.Panel, {

    constructor: function(config) {
        var defaults = {
            "title": CQ.I18n.getMessage("Tool options"),
            "floating": true,
            "draggable": {
                "insertProxy": false,
                "onDrag": function(e) {
                    var pel = this.proxy.getEl();
                    this.x = pel.getLeft(true);
                    this.y = pel.getTop(true);
                    var s = this.panel.getEl().shadow;
                    if (s) {
                        s.realign(this.x, this.y, pel.getWidth(), pel.getHeight());
                    }
                },
                "endDrag": function(e) {
                    this.panel.setPosition(this.x, this.y);
                }
            },
            "collapsible": true,
            "renderTo": CQ.Util.ROOT_ID,
            "width": 400,
            "hidden": true,
            "stateful": false
        };
        CQ.Util.applyDefaults(config, defaults);
        if (!config.items && !config.tbar && !config.bbar) {
            config.html = "No tools available";
        }
        CQ.form.ExtendedSmartImage.ExtendedTool.UserInterface.superclass.constructor.call(this, config);
    },

    /**
     * Sets the Position of the user interface component.
     * @param {Number} x The horizontal position
     * @param {Number} y The vertical position
     */
    setPosition: function(x, y) {
        CQ.form.ExtendedSmartImage.ExtendedTool.UserInterface.superclass.setPosition.call(this, x, y);
        this.saveX = this.x;
        this.saveY = this.y;
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
 * @class CQ.form.ExtendedSmartImage.Shape
 * @private
 * <p>The SmartImage.Shape defines a basic implementation of a shape that may be used to
 * overlay an image displayed inside a {@link CQ.form.SmartImage.ImagePanel}.</p>
 * <p>SmartImage.Shape works more or less as an interface which has to be extended by a
 * concrete implementation. Several standard implementations (rectangle, circle, polygon
 * used by {@link CQ.form.ExtendedImageMap}) are provided by CQ5 and may be further extended.</p>
 */

CQ.form.ExtendedSmartImage.Shape = CQ.Ext.extend(CQ.Ext.emptyFn, {

    // Helpers -----------------------------------------------------------------------------

    /**
     * Calculates the distance between the two specified coordinates.
     * @param {Object} coord1 The first coordinates; properties: x, y
     * @param {Object} coord2 The second coordinates; properties: x, y
     */
    calculateDistance: function(coord1, coord2) {
        return Math.sqrt(Math.pow(coord1.x - coord2.x, 2)
                + Math.pow(coord1.y - coord2.y, 2));
    },

    /**
     * Calculates display coordinates of the specified coordinates, respecting the specified
     * zoom factor and the specified display offsets.
     * @param {Number} zoom The absolute zoom factor
     * @param {Object} offsets The offsets (as passed to {@link #draw})
     * @param {Number|Object} x The horizontal coordinate or an object containing the
     *        coordinates (properties: x, y)
     * @param {Number} y The vertical coordinate (optional); only used if x</code> is
     *                   passed as a Number
     * @return {Object} The display coordinates (properties: x, y)
     */
    calculateDisplayCoords: function(zoom, offsets, x, y) {
        if (typeof(x) == "object") {
            y = x.y;
            x = x.x;
        }
        x = Math.round((x - offsets.srcX) * zoom) + offsets.destX;
        y = Math.round((y - offsets.srcY) * zoom) + offsets.destY;
        return {
            "x": x,
            "y": y
        };
    },

    /**
     * Calculates the display size from the specified unzoomed size, respecting the
     * specified zoom factor.
     * @param {Number} zoom The absolute zoom factor
     * @param {Number|Object} width The width or an object containing the size (properties:
     *        width, height)
     * @param {Number} height The height (optional); only used if width is passed as a
     *        Number
     * @return {Object} The display size; properties: width, height
     */
    calculateDisplaySize: function(zoom, width, height) {
        if (typeof(width) == "object") {
            height = width.height;
            width = width.width;
        }
        width = Math.round(width * zoom);
        height = Math.round(height * zoom);
        return {
            "width": width,
            "height": height
        };
    },


    // Events ------------------------------------------------------------------------------

    /**
     * This method may be overriden if the shape wants to react on rollover events.
     * @param {Object} coords The coordinates of the rollover; properties: x, y
     * @return {Boolean} True if a redraw of the Shape is required
     */
    onRollOver: function(coords) {
        return false;
    },

    /**
     * This method may be overriden if the shape wants to react on rollout events.
     * @param {Object} coords The coordinates of the rollout (properties: x, y); may be
     *        null, if the rollout is caused programmatically
     * @return {Boolean} True if a redraw of the Shape is required
     */
    onRollOut: function(coords) {
        return false;
    },

    /**
     * This method may be overriden if the shape wants to react on events that are sent
     * on mouse moves while being rolled over.
     * @param {Object} coords coordinates of the rollover; properties: x, y
     * @return {Boolean} True if a redraw of the Shape is required
     */
    onRolledOver: function(coords) {
        return false;
    },

    /**
     * This method may be overriden if the shape wants to react on select events.
     * @return {Boolean} True if a redraw of the shape is required
     */
    onSelect: function() {
        return false;
    },

    /**
     * This method may be overriden if the shape wants to react on unselect events.
     * @return {Boolean} True if a redraw of the shape is required
     */
    onUnSelect: function() {
        return false;
    },

    /**
     * <p>This method may be overriden if the shape wants to react on click events.</p>
     * <p>onClick is called after {@link #onSelect}/{@link #onUnselect}.</p>
     * @return {Boolean} True if a redraw of the shape is required
     */
    onClick: function() {
        return false;
    },


    // Drag & Drop -------------------------------------------------------------------------

    /**
     * <p>This method must check if the shape is directly draggable through the specified
     * coordinates.</p>
     * <p>"Direct draggable" means that there is no movement threshold imposed, whereas
     * "deferred draggable" requires the mouse to be moved by some pixels for the
     * dragging to be actually started.</p>
     * @param {Object} coords Coordinates to check; properties: x, y
     * @param {Number} tolerance The tolerance distance
     * @return {Boolean} True if the shape is directly draggable
     */
    isDirectlyDraggable: function(coords, tolerance) {
        return false;
    },

    /**
     * This method must check if the shape is deferred draggable through the specified
     * coordinates.
     * <p>"Deferred draggable" requires the mouse to be moved by some pixels for the
     * dragging to be actually started, whereas "Direct draggable" means that there is no
     * such movement threshold imposed.</p>
     * @param {Object} coords Coordinates to check; properties: x, y
     * @param {Number} tolerance The tolerance distance
     * @return {Boolean} True if the shape id deferred draggable
     */
    isDeferredDraggable: function(coords, tolerance) {
        return false;
    },

    /**
     * <p>This method must move the whole shape or a suitable edge/corner of the shape by
     * the specified pixel offsets.</p>
     * <p>Note that the specified offsets are relative to the coordinates passed to
     * {@link #onDragStart}, and not relative to the last mouse move. This might add
     * additional calculation overhead to the method, but is necessary to efficently
     * handle "out of image"/"out of components coordinates.</p>
     * <p>The {@link #onDragStart} method should be used to detect if the whole shape or
     * a suitable edge/corner of the shape has to be moved.</p>
     * @param {Number} xOffs The horizontal offset
     * @param {Number} yOffs The vertical offset
     * @param {Object} coords The actual coordinates of the mouse pointer; properties: x, y
     * @return {Boolean} True if a redraw of the shape is required
     */
    moveShapeBy: function(xOffs, yOffs, coords) {
        return false;
    },

    /**
     * <p>This method is called when dragging starts.</p>
     * <p>The implementing Shape should override this method and at least detect if the
     * shape as a whole should be moved (or only a single edge/corner of it).
     * @param {Object} coords coordinates where dragging starts
     * @param {Number} tolerance tolerance distance
     * @return {Boolean} True if a redraw of the shape is required
     */
    onDragStart: function(coords, tolerance) {
        // may be overridden by the implementing shape
        return false;
    },

    /**
     * This method is called when dragging ends.
     * @param {Object} coords coordinates where dragging ends
     * @param {Number} tolerance tolerance distance
     * @return {Boolean} True if a redraw of the shape is required
     */
    onDragEnd: function(coords, tolerance) {
        // may be overridden by the implementing shape
        return false;
    },

    /**
     * This method is called while a shape is being dragged.
     * @param {Object} coords Current coordinates; properties: x, y
     * @param {Number} tolerance The tolerance distance
     * @return {Boolean} True if a redraw of the shape is required
     */
    onDrag: function(coords, tolerance) {
        // may be overridden by the implementing shape
        return false;
    },

    /**
     * <p>This method is called on shapes that were added in a "add request" event to the
     * list of scheduled drag shapes before the dragging is actually started.</p>
     * <p>The method should be used to set the correct handle when adding a shape, for
     * example the bottom right for rectangles.</p>
     * @param {Object} coords Coordinates; properties: x, y
     */
    onAddForDrag: function(coords) {
        // may be overridden by the implementing shape
    },


    // View --------------------------------------------------------------------------------

    /**
     * <p>In this method, the implementing Shape must check if the specified coordinate is a
     * "mouseover" for the Shape.</p>
     * <p>The specified coordinates are the coordinates of the unscaled image.</p>
     * @param {Object} coords Coordinates
     * @param {Number} tolerance The tolerance distance
     * @return {Boolean} True if the Shape is "touched" by the mouse
     */
    isTouched: function(coords, tolerance) {
        return false;
    },

    /**
     * <p>In this method, the implementing Shape must draw itself, respecting the specified
     * parameters.<p>
     * <p>Note that the canvas context is in an initial state when the method is called.</p>
     * @param {Object} ctx The canvas context to be used for drawing
     * @param {Number} zoom The real zoom factor (1.0 means that the original size should be
     *        used)
     * @param {Object} offsets Drawing offsets; properties: srcX, srcY, destX, destY,
     *        imageSize, zoomedSize - todo document the meaning of these properties
     */
    draw: function(ctx, zoom, offsets) {
        // to be overriden by the implementing class
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
 * @class CQ.form.ExtendedSmartImage.ShapeSet
 * @private
 * <p>The SmartImage.ShapeSet provides a set of shapes.</p>
 * <p>ShapeSets may be used to group shapes that serve a distinct purpose, e.g. all shapes
 * defining the map of an image.</p>
 * @constructor
 * Creates a new SmartImage.ShapeSet.
 * @param {String} id ID of shape set to add
 */
CQ.form.ExtendedSmartImage.ShapeSet = CQ.Ext.extend(CQ.Ext.emptyFn, {

    // Properties --------------------------------------------------------------------------

    /**
     * @property {String}
     * ID of the shape set (read-only property)
     */
    id: null,

    /**
     * @property {Boolean}
     * Flag that determines if the shape set is visible
     */
    isVisible: false,

    /**
     * Array of shapes that define the shape set
     * @private
     * @type CQ.form.ExtendedSmartImage.Shape[]
     */
    shapes: null,

    /**
     * Backreference to the image where the shape set is used. This is set when the
     * shape set is added to the image component.
     * @private
     */
    imageComponent: null,


    // Lifecycle ---------------------------------------------------------------------------

    constructor: function(id) {
        this.id = id;
        this.isVisible = true;
        this.shapes = new Array();
    },


    // Shape management --------------------------------------------------------------------

    /**
     * <p>Adds an existing Shape to the set.</p>
     * <p>The change is propagated to the view.</p>
     * @param {CQ.form.ExtendedSmartImage.Shape} shapeToAdd The shape to add
     */
    addShape: function(shapeToAdd) {
        this.shapes.push(shapeToAdd);
        if (this.imageComponent) {
            this.imageComponent.addShapeToDOM(shapeToAdd);
            this.imageComponent.drawImage();
        }
    },

    /**
     * <p>Removes a shape from the set.</p>
     * <p>The change is propagated to the view.</p>
     * @param {CQ.form.ExtendedSmartImage.Shape} shapeToRemove The shape to remove
     */
    removeShape: function(shapeToRemove) {
        var removeIndex = this.getShapeIndex(shapeToRemove);
        if (removeIndex >= 0) {
            this.shapes.splice(removeIndex, 1);
            if (this.imageComponent) {
                this.imageComponent.removeShapeFromDOM(shapeToRemove);
                this.imageComponent.drawImage();
            }
        }
    },

    /**
     * <p>Removes all shapes from the current set.</p>
     * <p>The change is propagated to the view.</p>
     */
    removeAllShapes: function() {
        var shapeCnt = this.shapes.length;
        for (var shapeIndex = shapeCnt - 1; shapeIndex >= 0; shapeIndex--) {
            this.removeShape(this.shapes[shapeIndex]);
        }
    },

    /**
     * Gets the position of the specified shape in the list of shapes.
     * @param {CQ.form.ExtendedSmartImage.Shape} shape The shape for which the index should be
     *        obtained
     * @return {Number} The index of the specified shape; -1 if the shape is not contained
     *         in the shape set
     */
    getShapeIndex: function(shape) {
        var shapeCnt = this.shapes.length;
        for (var shapeIndex = 0; shapeIndex < shapeCnt; shapeIndex++) {
            var shapeToCheck = this.shapes[shapeIndex];
            if (shapeToCheck == shape) {
                return shapeIndex;
            }
        }
        return -1;
    },

    /**
     * Gets the number of shapes contained in this ShapeSet.
     * @return {Number} The number of shapes contained in this ShapeSet
     */
    getShapeCount: function() {
        return this.shapes.length;
    },

    /**
     * Gets a shape by its position in this ShapeSet.
     * @param {Number} shapeIndex The shape's position in the set
     * @return {CQ.form.ExtendedSmartImage.Shape} The Shape at the specified position; null if an
     *         invalid position has been specified
     */
    getShapeAt: function(shapeIndex) {
        return this.shapes[shapeIndex];
    },

    /**
     * Sets the visibility of the shape set.
     * @param {Boolean} isVisible True if the shape set is visible
     */
    setVisible: function(isVisible) {
        this.isVisible = isVisible;
        if (CQ.Ext.isIE) {
            this.executeFnOnShapes(function(shape) {
                var canvas = shape.shapeDef.canvas;
                var ctx = canvas.getContext("2d");
                ctx.clearRect();
            });
        }
    },

    /**
     * Draws all shapes of the current ShapeSet.
     * @param {CanvasRenderingContext2D} ctx The main canvas context
     * @param {Number} zoom The absolute zoom factor
     * @param {Object} offsets Drawing offsets; properties: srcX, srcY, destX, destY,
     *        imageSize, zoomedSize
     */
    drawShapes: function(ctx, zoom, offsets) {
        var shapeCnt = this.shapes.length;
        for (var shapeIndex = 0; shapeIndex < shapeCnt; shapeIndex++) {
            var shapeToDraw = this.shapes[shapeIndex];
            if (CQ.Ext.isIE) {
                ctx = shapeToDraw.shapeDef.canvas.getContext("2d");
                ctx.clearRect();
            }
            ctx.save();
            if (CQ.themes.SmartImage.DEFAULT_DRAWING_MODE != null) {
                ctx.globalCompositeOperation = CQ.themes.SmartImage.DEFAULT_DRAWING_MODE;
            }
            shapeToDraw.draw(ctx, zoom, offsets);
            ctx.restore();
        }
    },

    /**
     * Executes the specified function for each shape in this shape set.
     * @param {Function} fnToExecute The function to execute on each shape
     */
    executeFnOnShapes: function(fnToExecute) {
        var shapeCnt = this.shapes.length;
        for (var shapeIndex = 0; shapeIndex < shapeCnt; shapeIndex++) {
            var shapeToExecute = this.shapes[shapeIndex];
            fnToExecute(shapeToExecute);
        }
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
 * @class CQ.form.ExtendedSmartImage.Animation
 * @private
 * The SmartImage.Animation defines a generic
 * animation mechanism that can be used for canvas based animations.
 */
CQ.form.ExtendedSmartImage.Animation = CQ.Ext.extend(CQ.Ext.emptyFn, {

    // Properties --------------------------------------------------------------------------

    /**
     * @cfg {CQ.form.ExtendedSmartImage.ImageComponent} The image component responsible for drawing
     * the animation (required!)
     */
    imageComponent: null,

    /**
     * @cfg {Function} onFinished Callback function that is called when the animation has
     * finished
     */
    onFinished: null,

    /**
     * The steps of the animation. Elements of type
     * <code>CQ.form.ExtendedSmartImage.Animation.Step</code>.
     * @private
     * @type Array
     */
    steps: null,

    /**
     * Number of currently played step; <code>null</code> if the animation is currently
     * stopped.
     * @private
     * @type Number
     */
    stepPlayed: null,

    /**
     * Timecode when the currently played tick has been started.
     * @private
     * @type Number
     */
    stepStartTc: null,


    // Lifecycle ---------------------------------------------------------------------------

    constructor: function(config) {
        config = config || { };
        var defaults = {
            // not yet available ...
        };
        CQ.Ext.apply(this, config, defaults);
        this.steps = [ ];
        this.stepPlayed = null;
    },


    // Management of animation steps -------------------------------------------------------

    /**
     * Adds a step to the animation.
     * @param {CQ.stepToAdd
     */
    addStep: function(stepToAdd) {
        this.steps.push(stepToAdd);
    },

    /**
     * Checks if the animation is currently played.
     * @return {Boolean} True if the animation is currently played, else false
     */
    isPlayed: function() {
        return this.stepPlayed != null;
    },


    // Animation ---------------------------------------------------------------------------

    /**
     * Starts the playback pof the animation
     */
    play: function() {
        this.stepPlayed = 0;
        this.stepStartTc = new Date().getTime();
        this.playTick();
    },

    /**
     * Plays a single animation pahse (tick).
     */
    playTick: function() {
        var tickTc = new Date().getTime();
        if (this.stepPlayed < this.steps.length) {
            var stepToPlay = this.steps[this.stepPlayed];
            var timeCursor = tickTc - this.stepStartTc;
            var fraction = 1.0;
            if (stepToPlay.durationMs > 0) {
                fraction = timeCursor / stepToPlay.durationMs;
            }
            if (fraction >= 1.0) {
                fraction = 1.0;
                this.stepPlayed++;
                this.stepStartTc = tickTc;
            }
            stepToPlay.tick(this.imageComponent, fraction);
            window.setTimeout(this.playTick.createDelegate(this), 10);
        } else {
            this.stepPlayed = null;
            if (this.onFinished) {
                this.onFinished(this);
            }
        }
    }

});


/**
 * @class CQ.form.ExtendedSmartImage.Animation.Step
 * @private
 * The SmartImage.Animation.Step defines a generic antimation
 * mechanism that can be used for canvas based animations.
 * @constructor
 * Creates a new SmartImage.Animation.Step.
 * @param {Object} config The config object
 */
CQ.form.ExtendedSmartImage.Animation.Step = CQ.Ext.extend(CQ.Ext.emptyFn, {

    // Properties --------------------------------------------------------------------------

    /**
     * @cfg {Number} durationMs Duration of the current animation step in milliseconds
     */
    durationMs: 0,


    // Lifecycle ---------------------------------------------------------------------------

    constructor: function(config) {
        config = config || { };
        var defaults = {
            "durationMs": 500
        };
        CQ.Ext.apply(this, config, defaults);
    },


    // Interface ---------------------------------------------------------------------------

    /**
     * In this method a single animation phase ("tick") has to be executed.
     * @param {CQ.form.ExtendedSmartImage} imageComponent The image component to be used for
     *                                            drawing the animation phase
     * @param {Number} fraction Fraction of the animation step, where 0 means "start of
     *                          the step", 0.5 "middle of the step" and 1 "end of the step"
     */
    tick: function(imageComponent, fraction) {
        // must be overridden by implementing classes
    }

});


/**
 * @class CQ.form.ExtendedSmartImage.Animation.Rotation
 * @extends CQ.form.ExtendedSmartImage.Animation.Step
 * @private
 * An rotation effect for SmartImage.
 * @constructor
 * Creates a new ExtendedSmartImage.Animation.Rotation.
 * @param {Object} config The config object
 */
CQ.form.ExtendedSmartImage.Animation.Rotation = CQ.Ext.extend(CQ.form.ExtendedSmartImage.Animation.Step, {

    // Properties --------------------------------------------------------------------------

    /**
     * @cfg {Number} startAngle Starting angle of the rotation (degrees)
     */
    startAngle: null,

    /**
     * @cfg {Object} startSize Starting size of the image during rotation
     */
    startSize: null,

    /**
     * @cfg {Number} endAngle Ending angle of the rotation (degrees)
     */
    endAngle: null,

    /**
     * @cfg {Object} startSize Ending size of the image during rotation
     */
    endSize: null,

    /**
     * @cfg {CQ.form.ExtendedSmartImage.Image} The image to rotate
     */
    image: null,

    /**
     * Delta of angles
     * @private
     * @type Number
     */
    deltaAngle: null,

    /**
     * Delta of sizes
     * @private
     * @type Object
     */
    deltaSize: null,


    // Lifecycle ---------------------------------------------------------------------------

    constructor: function(config) {
        CQ.form.ExtendedSmartImage.Animation.Rotation.superclass.constructor.call(this, config);
        this.deltaAngle = this.endAngle - this.startAngle;
        this.deltaSize = {
            "width": this.endSize.width - this.startSize.width,
            "height": this.endSize.height - this.startSize.height
        };
    },


    // Interface implementation ------------------------------------------------------------

    /**
     * Executes a single animation phase of a rotation.
     * @param {CQ.form.ExtendedSmartImage} imageComponent The image component to be used for
     *                                            drawing the animation phase
     * @param {Number} fraction Fraction of the animation step, where 0 means "start of
     *                          the step", 0.5 "middle of the step" and 1 "end of the step"
     */
    tick: function(imageComponent, fraction) {
        var imagePanel = imageComponent.getImagePanel();
        var destAngle = this.startAngle + (fraction * this.deltaAngle);
        var destSize = {
            "width": this.startSize.width + (fraction * this.deltaSize.width),
            "height": this.startSize.height + (fraction * this.deltaSize.height)
        };
        var ctx = imagePanel.getCanvasContext();
        ctx.save();
        var canvasWidth = imagePanel.imageCanvas.width;
        var canvasHeight = imagePanel.imageCanvas.height;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        var workingAreaSize = imagePanel.workingAreaSize;
        var transX = Math.floor(workingAreaSize.width / 2);
        var transY = Math.floor(workingAreaSize.height / 2);
        ctx.translate(transX, transY);
        ctx.rotate((destAngle * Math.PI) / 180);
        var xPos = - (destSize.width / 2);
        var yPos = - (destSize.height / 2);
        ctx.drawImage(this.image.image, xPos, yPos, destSize.width, destSize.height);
        ctx.restore();
    }

});


/**
 * @class CQ.form.ExtendedSmartImage.Animation.ZoomOut
 * @extends CQ.form.ExtendedSmartImage.Animation.Step
 * @private
 * A zoom-out effect for SmartImage.
 * @constructor
 * Creates a new ExtendedSmartImage.Animation.ZoomOut.
 * @param {Object} config The config object
 */
CQ.form.ExtendedSmartImage.Animation.ZoomOut = CQ.Ext.extend(CQ.form.ExtendedSmartImage.Animation.Step, {

    // Properties --------------------------------------------------------------------------

    /**
     * @cfg {Number} startZoom Starting zoom factor
     */
    startZoom: null,

    /**
     * @cfg {Number} endZoom Ending zoom factor
     */
    endZoom: null,

    /**
     * Delta zoom factor.
     * @private
     * @type Number
     */
    deltaZoom: null,


    // Lifecycle ---------------------------------------------------------------------------

    constructor: function(config) {
        CQ.form.ExtendedSmartImage.Animation.ZoomOut.superclass.constructor.call(this, config);
        this.deltaZoom = this.endZoom - this.startZoom;
    },


    // Interface implementation ------------------------------------------------------------

    /**
     * Executes a single animation phase of the zoom.
     * @param {CQ.form.ExtendedSmartImage} imageComponent The image component to be used for
     *                                            drawing the animation phase
     * @param {Number} fraction Fraction of the animation step, where 0 means "start of
     *                          the step", 0.5 "middle of the step" and 1 "end of the step"
     */
    tick: function(imageComponent, fraction) {
        var imagePanel = imageComponent.getImagePanel();
        var destZoom = this.startZoom + (fraction * this.deltaZoom);
        imagePanel.setZoom(destZoom);
        if (fraction == 1.0) {
            imageComponent.resetZoomSlider();
        }
    }

});


/**
 * @class CQ.form.ExtendedSmartImage.Animation.ExecuteFn
 * @extends CQ.form.ExtendedSmartImage.Animation.Step
 * @private
 * An animation step executing the specified function (once).
 * Used in SmartImage.
 * @constructor
 * Creates a new ExtendedSmartImage.Animation.ExecuteFn.
 * @param {Object} config The config object
 */
CQ.form.ExtendedSmartImage.Animation.ExecuteFn = CQ.Ext.extend(CQ.form.ExtendedSmartImage.Animation.Step, {

    // Properties --------------------------------------------------------------------------

    /**
     * @cfg {Function} fn Function to execute
     */
    fn: null,

    /**
     * @cfg {Object} scope (optional) Scope for the function to be executed
     */
    scopr: null,


    // Lifecycle ---------------------------------------------------------------------------

    constructor: function(config) {
        config = config || { };
        var defaults = {
            "durationMs": 0
        };
        config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.ExtendedSmartImage.Animation.ExecuteFn.superclass.constructor.call(this, config);
        this.deltaZoom = this.endZoom - this.startZoom;
    },


    // Interface implementation ------------------------------------------------------------

    /**
     * Executes the JavaScript call (only once).
     * @param {CQ.form.ExtendedSmartImage} imageComponent The image component to be used for
     *                                            drawing the animation phase
     * @param {Number} fraction Fraction of the animation step, where 0 means "start of
     *                          the step", 0.5 "middle of the step" and 1 "end of the step"
     */
    tick: function(imageComponent, fraction) {
        if (this.fn != null) {
            if (this.scope) {
                this.fn.call(this.scope);
            } else {
                this.fn();
            }
            this.fn = null;
        }
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
 * @class CQ.form.ExtendedImageMap
 * @extends CQ.form.ExtendedSmartImage.ExtendedTool
 * @private
 * The ExtendedImageMap provides the image map tool for {@link CQ.form.ExtendedSmartImage}.
 * @constructor
 * Creates a new ImageMap.
 * @param {String} transferFieldName Name of the form field that is used for transferring
 * the image crop information
 */
CQ.form.ExtendedImageMap = CQ.Ext.extend(CQ.form.ExtendedSmartImage.ExtendedTool, {

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
        CQ.form.ExtendedImageMap.superclass.constructor.call(this, {
            "toolId": "smartimageMap",
            "toolName": CQ.I18n.getMessage("Map"),
            "iconCls": "cq-image-icon-map",
            "isCommandTool": false,
            "userInterface": new CQ.form.ExtendedImageMap.UI( {
                "title": CQ.I18n.getMessage("Image map tools")
            }),
            "transferFieldName": transferFieldName
        });
    },

    /**
     * Initializes the tool's components by registering the underlying
     * {@link CQ.form.ExtendedSmartImage.ImagePanel} and all necessary event handlers.
     * @param {CQ.form.ExtendedSmartImage} imageComponent The underlying image panel
     */
    initComponent: function(imageComponent) {
        CQ.form.ExtendedImageMap.superclass.initComponent.call(this, imageComponent);
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
        CQ.form.ExtendedImageMap.superclass.onActivation.call(this);
        if (!this.isInitialized) {
            if (this.mapShapeSet == null) {
                this.mapShapeSet =
                        new CQ.form.ExtendedSmartImage.ShapeSet(CQ.form.ExtendedImageMap.SHAPESET_ID);
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
        this.workingArea.setShapeSetVisible(CQ.form.ExtendedImageMap.SHAPESET_ID, true, true);
    },

    /**
     * Handler that is called when the image map tool is deactivated.
     */
    onDeactivation: function() {
        this.workingArea.clearSelection();
        this.userInterface.isActive = false;
        this.workingArea.setShapeSetVisible(CQ.form.ExtendedImageMap.SHAPESET_ID, false, false);
        CQ.form.ExtendedImageMap.superclass.onDeactivation.call(this);
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
        CQ.form.ExtendedImageMap.superclass.onImageUploaded.call(this);
    },

    /**
     * Handler that removes mapping information when the image gets flushed.
     */
    onImageFlushed: function() {
        this.clearMappingInformation();
        CQ.form.ExtendedImageMap.superclass.onImageFlushed.call(this);
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
                        new CQ.form.ExtendedSmartImage.ShapeSet(CQ.form.ExtendedImageMap.SHAPESET_ID);
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
        CQ.form.ExtendedImageMap.superclass.transferToField.call(this);
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
                if (CQ.form.ExtendedImageMap.RectArea.isStringRepresentation(areaDef)) {
                    area = CQ.form.ExtendedImageMap.RectArea.deserialize(areaDef);
                } else if (CQ.form.ExtendedImageMap.PolyArea.isStringRepresentation(areaDef)) {
                    area = CQ.form.ExtendedImageMap.PolyArea.deserialize(areaDef);
                } else if (CQ.form.ExtendedImageMap.CircularArea.isStringRepresentation(areaDef)) {
                    area = CQ.form.ExtendedImageMap.CircularArea.deserialize(areaDef);
                }
                if (area != null) {
                    var oldProcessingPos = processingPos;
                    processingPos =
                            area.destination.deserialize(strDefinition, coordEndPos + 1);
                    this.mapShapeSet.addShape(area);
                    if (processingPos == null) {
                        CQ.Log.error("CQ.form.ExtendedImageMap#deserialize: Invalid map definition: " + strDefinition + "; trying to continue parsing.");
                        processingPos = strDefinition.indexOf("]", oldProcessingPos) + 1;
                    }
                } else {
                    CQ.Log.error("CQ.form.ExtendedImageMap#deserialize: Invalid area definition string: " + areaDef);
                    processingPos = strDefinition.indexOf("]", processingPos) + 1;
                }
            }
        }
    },

    // overrides CQ.form.ExtendedSmartImage.ExtendedTool#isEnabled
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

/**
 * Shape set ID to be used by image map.
 * @static
 * @final
 * @type String
 * @private
 */
CQ.form.ExtendedImageMap.SHAPESET_ID = "smartimage.imagemap";

/**
 * Edit mode: Add an element (new area or additional polygon point)
 * @static
 * @final
 * @type Number
 * @private
 */
CQ.form.ExtendedImageMap.EDITMODE_ADD = 0;

/**
 * Edit mode: Edit existing areas and/or polygon points
 * @static
 * @final
 * @type Number
 * @private
 */
CQ.form.ExtendedImageMap.EDITMODE_EDIT = 1;

/**
 * Area type: Square
 * @static
 * @final
 * @type Number
 * @private
 */
CQ.form.ExtendedImageMap.AREATYPE_RECT = 0;

/**
 * Area type: Circle
 * @static
 * @final
 * @type Number
 * @private
 */
CQ.form.ExtendedImageMap.AREATYPE_CIRCLE = 1;

/**
 * Area type: Polygon
 * @static
 * @final
 * @type Number
 * @private
 */
CQ.form.ExtendedImageMap.AREATYPE_POLYGON = 2;

/**
 * Area type: Point (as a part of a polygon)
 * @static
 * @final
 * @type Number
 * @private
 */
CQ.form.ExtendedImageMap.AREATYPE_POINT = 3;

/**
 * Prefix for events fired by the component
 * @static
 * @final
 * @type String
 * @private
 */
CQ.form.ExtendedImageMap.EVENT_PREFIX = "imagemap.";

/**
 * Name of the "modechange" event. This is sent if the edit mode is changed implicitly by
 * the canvas, for example when automatically switching from "add polygon" to "add polygon
 * point" mode.
 * @static
 * @final
 * @type String
 * @private
 */
CQ.form.ExtendedImageMap.EVENT_MODE_CHANGE = CQ.form.ExtendedImageMap.EVENT_PREFIX + "modechange";

/**
 * Name of the "visualchange" event. This is sent if the area(s) currently edited have
 * visually changed.
 * @static
 * @final
 * @type String
 * @private
 */
CQ.form.ExtendedImageMap.EVENT_VISUAL_CHANGE = CQ.form.ExtendedImageMap.EVENT_PREFIX + "visualchange";

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
 * @class CQ.form.ExtendedImageMap.UI
 * @extends CQ.form.ExtendedSmartImage.ExtendedTool.UserInterface
 * @private
 * The ExtendedImageMap.UI provides the external user interface
 * for the image map tool.
 * @constructor
 * Creates a new ImageMap.UI.
 * @param {Object} config The config object
 */
CQ.form.ExtendedImageMap.UI = CQ.Ext.extend(CQ.form.ExtendedSmartImage.ExtendedTool.UserInterface, {

    /**
     * Flag if the tool is currently active (managed by {@link CQ.form.ExtendedImageMap})
     * @private
     * @type Boolean
     */
    isActive: false,

    /**
     * The basic working area
     * @private
     * @type CQ.form.ExtendedSmartImage.ImagePanel
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
     * @type CQ.form.ExtendedImageMap.PolyArea
     */
    polyAreaAdded: null,

    /**
     * The {@link CQ.form.ExtendedSmartImage.ShapeSet} used to display the map's areas.
     * @private
     * @type CQ.form.ExtendedSmartImage.ShapeSet
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
                    "xtype": "linkdialog",
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
                    "fieldLabel": "Text"
                }, {
                    "itemId": "areaDefCoords",
                    "name": "coords",
                    "xtype": "textfield",
                    "fieldLabel": "Coordinates"
                } ]
            } ]
        };
        CQ.Util.applyDefaults(config, defaults);
        CQ.form.ExtendedImageMap.UI.superclass.constructor.call(this, config);
    },

    /**
     * Initializes the user interface's components.
     */
    initComponent: function() {
        CQ.form.ExtendedImageMap.UI.superclass.initComponent.call(this);
        var linkFieldset = this.items.get("col1").items.get("areaDefUrl").dialog.items.itemAt(0).items.itemAt(0).items.itemAt(0).items;
        this.areaLinkTitle = linkFieldset.get("extendedLinkTitle");
        this.areaInternalLink = linkFieldset.get("extendedInternalLink");
        this.areaDeepLinkParam = linkFieldset.get("extendedDeepLinkParam");
        this.areaInPageLink = linkFieldset.get("extendedInPageLink");
        this.areaGlossaryLink = linkFieldset.get("extendedGlossaryLink");
        this.areaDisclaimerLink = linkFieldset.get("extendedDisclaimerLink");
        this.areaExternalLink = linkFieldset.get("extendedExternalLink");
        this.areaLinkParams = linkFieldset.get("extendedLinkParams");
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
     * @param {CQ.form.ExtendedSmartImage.ImagePanel} workingArea The working area
     * @param {CQ.form.ExtendedSmartImage.ShapeSet} mapShapeSet The shape set
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
            this.switchEditMode(CQ.form.ExtendedImageMap.EDITMODE_EDIT, null);
        } else if (value == "editPolyPoint") {
            this.switchEditMode(
                    CQ.form.ExtendedImageMap.EDITMODE_EDIT,
                    CQ.form.ExtendedImageMap.AREATYPE_POINT);
        } else if (value == "addRect") {
            this.switchEditMode(
                    CQ.form.ExtendedImageMap.EDITMODE_ADD,
                    CQ.form.ExtendedImageMap.AREATYPE_RECT);
        } else if (value == "addCircle") {
            this.switchEditMode(
                    CQ.form.ExtendedImageMap.EDITMODE_ADD,
                    CQ.form.ExtendedImageMap.AREATYPE_CIRCLE);
        } else if (value == "addPoly") {
            this.switchEditMode(
                    CQ.form.ExtendedImageMap.EDITMODE_ADD,
                    CQ.form.ExtendedImageMap.AREATYPE_POLYGON);
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
     * @param {CQ.form.ExtendedImageMap.Area} area Area to save data to
     */
    saveDestinationArea: function(area) {
        if (!area) {
            area = this.editedArea;
        }
        if (area) {
            area.destination.linkTitle = this.areaLinkTitle.getValue();
            area.destination.internalLink = this.areaInternalLink.getValue();
            area.destination.deepLinkParam = this.areaDeepLinkParam.getValue();
            area.destination.inPageLink = this.areaInPageLink.getValue();
            area.destination.disclaimerLink = this.areaDisclaimerLink.getValue();
            area.destination.glossaryLink = this.areaGlossaryLink.getValue();
            area.destination.externalLink = this.areaExternalLink.getValue();
            area.destination.linkParams = this.areaLinkParams.getValue();
            area.destination.target = this.areaDefTarget.getValue();
            area.destination.text = this.areaDefText.getValue();
            area.destination.captionText = this.areaDefCaptionText.getValue();
        }
    },

    /**
     * Loads the current content of the destination area editor from the specified image
     * area.
     * @param {CQ.form.ExtendedImageMap.Area} area area to load data from; null to clear the current
     *        content
     */
    loadDestinationArea: function(area) {
        if (area != null) {
            this.areaLinkTitle.setValue(area.destination.linkTitle);
            this.areaInternalLink.setValue(area.destination.internalLink);
            this.areaDeepLinkParam.setValue(area.destination.deepLinkParam);
            this.areaInPageLink.setValue(area.destination.inPageLink);
            this.areaDisclaimerLink.setValue(area.destination.disclaimerLink);
            this.areaGlossaryLink.setValue(area.destination.glossaryLink);
            this.areaExternalLink.setValue(area.destination.externalLink);
            this.areaLinkParams.setValue(area.destination.linkParams);
            this.areaDefTarget.setValue(area.destination.target);
            this.areaDefText.setValue(area.destination.text);
            this.areaDefCoords.setValue(area.toCoordString());
            this.areaDefCaptionText.setValue(area.destination.captionText);
        } else {
            this.areaLinkTitle.setValue("");
            this.areaInternalLink.setValue("");
            this.areaDeepLinkParam.setValue("");
            this.areaInPageLink.setValue("");
            this.areaDisclaimerLink.setValue("");
            this.areaGlossaryLink.setValue("");
            this.areaExternalLink.setValue("");
            this.areaLinkParams.setValue("");
            this.areaDefTarget.setValue("");
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
        if (this.editMode == CQ.form.ExtendedImageMap.EDITMODE_ADD) {
            this.finishPolygonBuilding(false);
            this.workingArea.blockRollOver();
            this.workingArea.clearSelection();
            this.workingArea.drawImage();
        } else if (this.editMode == CQ.form.ExtendedImageMap.EDITMODE_EDIT) {
            if (this.areaType != CQ.form.ExtendedImageMap.AREATYPE_POINT) {
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
        if (this.editMode == CQ.form.ExtendedImageMap.EDITMODE_EDIT) {
            if (this.areaType == CQ.form.ExtendedImageMap.AREATYPE_POINT) {
                valueToSelect = "editPolyPoint";
            } else {
                valueToSelect = "edit";
            }
        } else if (this.editMode == CQ.form.ExtendedImageMap.EDITMODE_ADD) {
            if (this.areaType == CQ.form.ExtendedImageMap.AREATYPE_RECT) {
                valueToSelect = "addRect";
            } else if (this.areaType == CQ.form.ExtendedImageMap.AREATYPE_POLYGON) {
                valueToSelect = "addPoly";
            } else if (this.areaType == CQ.form.ExtendedImageMap.AREATYPE_CIRCLE) {
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
            if (areaToCheck.areaType == CQ.form.ExtendedImageMap.AREATYPE_POLYGON) {
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
            if (this.editMode == CQ.form.ExtendedImageMap.EDITMODE_ADD) {
                var shapeToAdd;
                if (this.areaType == CQ.form.ExtendedImageMap.AREATYPE_RECT) {
                    shapeToAdd = new CQ.form.ExtendedImageMap.RectArea({ },
                        coords.y, coords.x, coords.y + 1, coords.x + 1);
                } else if (this.areaType == CQ.form.ExtendedImageMap.AREATYPE_CIRCLE) {
                    shapeToAdd = new CQ.form.ExtendedImageMap.CircularArea({ },
                        coords.x, coords.y, 1);
                } else if (this.areaType == CQ.form.ExtendedImageMap.AREATYPE_POLYGON) {
                    shapeToAdd = new CQ.form.ExtendedImageMap.PolyArea({ }, coords.x, coords.y);
                    shapeToAdd.selectPointAt(0);
                    this.polyAreaAdded = shapeToAdd;
                }
                if (shapeToAdd) {
                    this.workingArea.selectShape(shapeToAdd);
                    this.mapShapeSet.addShape(shapeToAdd);
                    this.workingArea.scheduleForDragging(shapeToAdd);
                }
            } else if ((this.editMode == CQ.form.ExtendedImageMap.EDITMODE_EDIT)
                    && (this.areaType == CQ.form.ExtendedImageMap.AREATYPE_POINT)) {
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
                    this.filterOnAreaType(polyToEdit, CQ.form.ExtendedImageMap.AREATYPE_POLYGON);
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
     * @param {CQ.form.ExtendedImageMap.Area[]} selectedAreas list with currently selected areas
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
     * @param {CQ.form.ExtendedImageMap.Area[]} changedAreas Array of areas that have changed (and
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
            if (isDragEnd && ((this.editMode == CQ.form.ExtendedImageMap.EDITMODE_ADD)
                    && (this.areaType == CQ.form.ExtendedImageMap.AREATYPE_POLYGON))) {
                this.switchEditMode(CQ.form.ExtendedImageMap.EDITMODE_EDIT,
                    CQ.form.ExtendedImageMap.AREATYPE_POINT);
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
     * @param {CQ.form.ExtendedImageMap.Area[]} listToFilter The area list to be filtered
     * @param {Number} areaType Area type to be recognized for the filtered list
     * @return {CQ.form.ExtendedImageMap.Area[]} The filtered list
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
 * @class CQ.form.ExtendedImageMap.Helpers
 * @static
 * @private
 * This static class provides helper functions used by the image map component.
 */
CQ.form.ExtendedImageMap.Helpers = function() {

    return {

        /**
         * Checks if the specified relative intersection coordinate (either horizontal or
         * vertical) is inside the valid range (0< to deltaValue if deltaValue &gt; 0; else
         * deltaValue to 0.
         * @param {Number} intersectValue relative (to the respective line start coordinate)
         *        intersection coordinate to check
         * @param {Number} deltaValue range to check
         */
        checkIntersection: function(intersectValue, deltaValue) {
            if (deltaValue < 0) {
                return (intersectValue > deltaValue) && (intersectValue <= 0);
            } else {
                return (intersectValue >= 0) && (intersectValue < deltaValue);
            }
        },

        /**
         * Calculates the distance for lines that do not extend in one dimension (vertical
         * and horizontal lines).
         * @param {Number} paraDist Distance to the line in the dimension the line does not
         *        extend (for vertical lines: horizontal coordinate)
         * @param {Number} orthDist Distance to the line in the orthogonal dimension (for
         *        vertical lines: vertical coordinate)
         * @param {Number} orthDelta Extent of the line (for vertical lines: vertical length
         *        of the line)
         * @return {Number} The correct distance in pixels
         */
        calculateNoAngledDistance: function(paraDist, orthDist, orthDelta) {
            var distance = Math.abs(paraDist);
            var otherEndDist = orthDist - orthDelta;
            if (orthDelta < 0) {
                if (orthDist > 0) {
                    distance = Math.sqrt(Math.pow(orthDist, 2) + Math.pow(paraDist, 2));
                } else if (orthDist < orthDelta) {
                    distance = Math.sqrt(Math.pow(otherEndDist, 2) + Math.pow(paraDist, 2));
                }
            } else {
                if (orthDist < 0) {
                    distance = Math.sqrt(Math.pow(orthDist, 2) + Math.pow(paraDist, 2));
                } else if (orthDist > orthDelta) {
                    distance = Math.sqrt(Math.pow(otherEndDist, 2) + Math.pow(paraDist, 2));
                }
            }
            return distance;
        },

        /**
         * <p>Calculates the distance of a point to a specified line.</p>
         * <p>The distance is calculated using the orthogonal. If no orthogonal exists, the
         * minimum distance of the point to one of the extreme line points is used.</p>
         * @param {Object} lineStart Starting point of the line (properties x, y)
         * @param {Object} lineEnd Ending point of the line (properties x, y)
         * @param {Object} point Point for which the distance has to be calculated;
         *        (properties x, y)
         * @return {Number} The distance of the point to the specified line
         */
        calculateDistance: function(lineStart, lineEnd, point) {
            var xOrigin = lineStart.x;
            var yOrigin = lineStart.y;
            var deltaX = lineEnd.x - xOrigin;
            var deltaY = lineEnd.y - yOrigin;
            var xDist = point.x - xOrigin;
            var yDist = point.y - yOrigin;
            if ((Math.abs(deltaX) > 0) && (Math.abs(deltaY) > 0)) {
                // lines with angles != 0, 90, 180, 270 degrees
                var slope = deltaY / deltaX;
                var invSlope = 1 / slope;
                var intersectionX = (xDist * invSlope + yDist) / (slope + invSlope);
                var intersectionY = intersectionX * slope;
                var hasIntersection =
                    CQ.form.ExtendedImageMap.Helpers.checkIntersection(intersectionX, deltaX)
                    && CQ.form.ExtendedImageMap.Helpers.checkIntersection(intersectionY, deltaY);
                if (hasIntersection) {
                    return Math.sqrt(Math.pow(intersectionX - xDist, 2)
                        + Math.pow(yDist - intersectionY, 2));
                } else {
                    // if no intersection could be detected, use the minimal distance to
                    // one of the extreme points of the line
                    var distStart = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
                    var distEnd = Math.sqrt(
                        Math.pow(xDist - deltaX, 2) + Math.pow(yDist - deltaY, 2));
                    return (distStart < distEnd ? distStart : distEnd);
                }
            } else {
                // lines with angles == 0, 90, 180, 270 degrees
                if ((deltaX == 0) && (deltaY == 0)) {
                    // point
                    return Math.sqrt(Math.pow(xDist, 2), Math.pow(yDist, 2));
                } else if (deltaX == 0) {
                    // vertical line
                    return CQ.form.ExtendedImageMap.Helpers
                            .calculateNoAngledDistance(xDist, yDist, deltaY);
                } else {
                    // horizontal line
                    return CQ.form.ExtendedImageMap.Helpers
                            .calculateNoAngledDistance(yDist, xDist, deltaX);
                }
            }
        },

        /**
         * Calculates the distance of a point to a specified circle's outline.
         * @param {Object} circleDef Circle definition (properties: x, y [specifiying the
         *        circle's center] and radius)
         * @param point Point (properties: x, y
         * @return {Number} The distance of the point to the specified line
         */
        calculateDistanceToCircle: function(circleDef, point) {
            var deltaX = point.x - circleDef.x;
            var deltaY = point.y - circleDef.y;
            var slope = deltaY / deltaX;
            if ((deltaX != 0) && (deltaY != 0)) {
                var angle = Math.atan(slope);
                var outlineX = Math.cos(angle) * circleDef.radius;
                var outlineY = Math.sin(angle) * circleDef.radius;
                if (deltaX < 0) {
                    outlineY = -outlineY;
                    outlineX = -outlineX;
                }
                var diffX = outlineX - deltaX;
                var diffY = outlineY - deltaY;
                return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
            } else {
                return Math.abs(deltaY - circleDef.radius);
            }
        },

        /**
         * Compacts the specified array: All elements of value null will be removed, the
         * array size will be adjusted accordingly.
         * @param {Array} arrayToCompact array to compact
         */
        compactArray: function(arrayToCompact) {
            var elementCnt = arrayToCompact.length;
            var destIndex = 0;
            for (var compactIndex = 0; compactIndex < elementCnt; compactIndex++) {
                if (arrayToCompact[compactIndex] != null) {
                    if (compactIndex != destIndex) {
                        arrayToCompact[destIndex] = arrayToCompact[compactIndex];
                    }
                    destIndex++;
                }
            }
            arrayToCompact.length = destIndex;
        },

        /**
         * <p>Encodes the specified string as follows:</p>
         * <ul>
         * <li>""" will be encoded to "\""</li>
         * <li>"[" will be encoded to "\["</li>
         * <li>"]" will be encoded to "\]"</li>
         * <li>"\" will be encoded to "\\"</li>
         * <li>"|" will be encoded to "\|"</li>
         * </ul>
         * @param {String} str String to encode
         * @return {String} The encoded string
         */
        encodeString: function(str) {
            var charCnt = str.length;
            var destStr = "";
            var copyPos = 0;
            for (var charIndex = 0; charIndex < charCnt; charIndex++) {
                var charToCheck = str.charAt(charIndex);
                var escapedChar = null;
                switch (charToCheck) {
                    case '\\':
                        escapedChar = "\\\\";
                        break;
                    case '\"':
                        escapedChar = "\\\"";
                        break;
                    case '[':
                        escapedChar = "\\[";
                        break;
                    case ']':
                        escapedChar = "\\]";
                        break;
                    case '|':
                        escapedChar = "\\|";
                        break;
                }
                if (escapedChar != null) {
                    if (copyPos < charIndex) {
                        destStr += str.substring(copyPos, charIndex);
                    }
                    destStr += escapedChar;
                    copyPos = charIndex + 1;
                }
            }
            if (copyPos < charCnt) {
                destStr += str.substring(copyPos, charCnt);
            }
            return destStr;
        },

        /**
         * <p>Decodes a string (encoded using {@link #encodeString}) that is contained in
         * another string. The (partial) string to parse has to be enclosed in quotation
         * marks.</p>
         * <p>For example:<br>
         * decodeFromContainingString("x:\&quot;abc\\&quot;\&quot;", 2)<br>
         * will return<br>
         * { "decoded": "abc&quot;", "nextPos": 9 }</p>
         * @param {String} containingString The containing string
         * @param {Number} parseStartPos The position where parsing should start
         * @return {Object} The decoding result; properties decoded (the decoded string),
         *         nextPos (the first character position after the closing quotation);
         *         null if no string could have been decoded
         */
        decodeFromContainingString: function(containingString, parseStartPos) {
            var quotPos = containingString.indexOf("\"", parseStartPos);
            if (quotPos < 0) {
                return null;
            }
            var isDone = false;
            var currentCharPos = quotPos + 1;
            var text = "";
            var isEscaped = false;
            while (!isDone) {
                var charToProcess = containingString.charAt(currentCharPos);
                if ((charToProcess == '\"') && (!isEscaped)) {
                    isDone = true;
                } else if (charToProcess == '\\') {
                    if (isEscaped) {
                        text += "\\";
                        isEscaped = false;
                    } else {
                        isEscaped = true;
                    }
                } else if (isEscaped) {
                    text += charToProcess;
                    isEscaped = false;
                } else {
                    text += charToProcess;
                }
                currentCharPos++;
                if ((currentCharPos >= containingString.length) && (!isDone)) {
                    return null;
                }
            }
            return { "decoded": text, "nextPos": currentCharPos };
        },

        /**
         * Parses a coordinate from a containing string, starting at the specified position.
         * @param {String} str The containing string
         * @param {Number} parseStartPos The (character) position where parsing will begin
         * @return {Object} properties: coordinate, nextPos (next parsing position) and
         *         isError (set to true if there was a parsing error); null if no more
         *         coordinates could have been parsed
         */
        parseCoordinateFromContainingString: function(str, parseStartPos) {
            var strLen = str.length;
            var processingPos = parseStartPos;
            // skip leasing spaces
            while (processingPos < strLen) {
                var charToCheck = str.charAt(processingPos);
                if (charToCheck != " ") {
                    break;
                }
                processingPos++;
            }
            if (processingPos >= strLen) {
                return null;
            }
            var result = new Object();
            result.isError = false;
            // determine type of coordinate
            if (str.charAt(processingPos) == "(") {
                // coordinate pair
                var coordEndPos = str.indexOf(")", processingPos + 1);
                if (coordEndPos < 0) {
                    result.isError = true;
                    return result;
                }
                var coords = str.substring(processingPos + 1, coordEndPos);
                var coordArray = coords.split("/");
                if (coordArray.length != 2) {
                    result.isError = true;
                    return result;
                }
                var x = parseInt(coordArray[0]);
                var y = parseInt(coordArray[1]);
                if (isNaN(x) || isNaN(y)) {
                    result.isError = true;
                    return result;
                }
                result.coordinates = { "x": x, "y": y };
                result.isCoordinatesPair = true;
                processingPos = coordEndPos + 1;
            } else {
                // special notation
                var sepPos = str.indexOf(":", processingPos);
                if (sepPos < (processingPos + 1)) {
                    result.isError = true;
                    return result;
                }
                var key = str.substring(processingPos, sepPos);
                var endPosSpace = str.indexOf(" ", sepPos + 1);
                var endPosBrace = str.indexOf("(", sepPos + 1);
                var value;
                if ((endPosSpace >= 0) && (endPosBrace >= 0)) {
                    if (endPosSpace < endPosBrace) {
                        value = str.substring(sepPos + 1, endPosSpace);
                        processingPos = endPosSpace;
                    } else {
                        value = str.substring(sepPos + 1, endPosBrace);
                        processingPos = endPosBrace;
                    }
                } else if (endPosSpace >= 0) {
                    value = str.substring(sepPos + 1, endPosSpace);
                    processingPos = endPosSpace;
                } else if (endPosBrace >= 0) {
                    value = str.substring(sepPos + 1, endPosBrace);
                    processingPos = endPosBrace;
                } else {
                    if ((sepPos + 1) >= str.length) {
                        result.isError = true;
                        return result;
                    }
                    value = str.substring(sepPos + 1, str.length);
                    processingPos = str.length;
                }
                if (key == "r") {
                    // radius
                    var radius = parseInt(value);
                    if (isNaN(radius)) {
                        result.isError = true;
                        return result;
                    }
                    result.coordinates = { "radius" : radius };
                    result.isCoordinatesPair = false;
                } else {
                    result.isError = true;
                    return result;
                }
            }
            result.nextPos = processingPos;
            return result;
        },

        /**
         * Parses a coordinate string and returns a list of coordinates.
         * @param {String} str string to parse
         * @return {Object} Properties: coordinates (Array with coordinate objects
         *         [properties: x, y or radius if a radius was specified],
         *         coordinatesPairCnt (number of coordinate pairs; may differ from the size
         *         of the coordinates object, if a radius or such has been specified));
         *         null if an invalid coordinate string has been specified
         */
        parseCoordinateString: function(str) {
            var coords = new Array();
            var parsePos = 0;
            var coordinatesPairCnt = 0;
            while (parsePos >= 0) {
                var parsePart = CQ.form.ExtendedImageMap.Helpers
                        .parseCoordinateFromContainingString(str, parsePos);
                if (parsePart != null) {
                    if (parsePart.isError) {
                        return null;
                    }
                    coords[coords.length] = parsePart.coordinates;
                    if (parsePart.isCoordinatesPair) {
                        coordinatesPairCnt++;
                    }
                    parsePos = parsePart.nextPos;
                } else {
                    // we are done here
                    parsePos = -1;
                }
            }
            return { "coordinates": coords, "coordinatesPairCnt": coordinatesPairCnt };
        },

        /**
         * Parses a CSS "rect" definition (Format: "rect([top] [right] [bottom] [left])";
         * currently no parsing tolerance regarding the format implemented).
         * @param {String} rectDef The CSS "rect" definition to parse
         * @return {Object} The parsed values; properties: top, left, bottom, right
         */
        parseRectDef: function(rectDef) {
            var clipDef = null;
            var startPos = rectDef.indexOf("(");
            if (startPos >= 0) {
                var endPos = rectDef.indexOf(")", startPos + 1);
                if (endPos > startPos) {
                    var clipDefStr = rectDef.substring(startPos + 1, endPos);
                    var clipDefCoords = clipDefStr.split(" ");
                    if (clipDefCoords.length == 4) {
                        clipDef = new Object();
                        clipDef.top = clipDefCoords[0];
                        clipDef.left = clipDefCoords[3];
                        clipDef.bottom = clipDefCoords[2];
                        clipDef.right = clipDefCoords[1];
                    }
                }
            }
            return clipDef;
        }

    };
}();
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
 * @class CQ.form.ExtendedImageMap.Area
 * @extends CQ.form.ExtendedSmartImage.Shape
 * @private
 * The CQ.form.ExtendedImageMap.Area is the basic class used for implementing the area types of an
 * image map.
 * @constructor
 * Creates a new ImageMap.Area.
 * @param {Number} areaType area type to create
 * @param {Object} config The config object
 */
CQ.form.ExtendedImageMap.Area = CQ.Ext.extend(CQ.form.ExtendedSmartImage.Shape, {

    /**
     * Type of the area; as represented by constants with prefix CQ.form.ExtendedImageMap.AREATYPE_
     * @type String
     * @private
     */
    areaType: null,

    /**
     * Destination of the area.
     * @type CQ.form.ExtendedImageMap.AreaDestination
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
        this.destination = new CQ.form.ExtendedImageMap.AreaDestination();
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
        CQ.Log.debug("CQ.form.ExtendedImageMap.Area.onRollOver: rollover detected.");
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
        CQ.Log.debug("CQ.form.ExtendedImageMap.Area.onRollOut: rollout detected.");
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
     * implementation of {@link CQ.form.ExtendedImageMap.Area}.</p>
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
 * @class CQ.form.ExtendedImageMap.RectArea
 * @extends CQ.form.ExtendedImageMap.Area
 * @private
 * This class represents a rectangular area of the image map.
 * @constructor
 * Creates a new ImageMap.RectArea.
 * @param {Number} top top edge of image area (incl.)
 * @param {Number} left left edge of image area (incl.)
 * @param {Number} bottom bottom edge of image area (incl.)
 * @param {Number} right right edge of image area (incl.)
 */
CQ.form.ExtendedImageMap.RectArea = CQ.Ext.extend(CQ.form.ExtendedImageMap.Area, {

    constructor: function(config, top, left, bottom, right) {
        CQ.form.ExtendedImageMap.RectArea.superclass.constructor.call(this,
                CQ.form.ExtendedImageMap.AREATYPE_RECT, config);
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
     *        imageSize, zoomedSize; (see {@link CQ.form.ExtendedSmartImage.Shape#draw})
     */
    draw: function(ctx, zoom, offsets) {
        CQ.Log.debug("CQ.form.ExtendedImageMap.RectArea#draw: Started.");
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
        CQ.Log.debug("CQ.form.ExtendedImageMap.RectArea#draw: Finished.");
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
        var coordDef = CQ.form.ExtendedImageMap.Helpers.parseCoordinateString(coordStr);
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
CQ.form.ExtendedImageMap.RectArea.isStringRepresentation = function(strToCheck) {
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
 * {@link CQ.form.ExtendedImageMap.RectArea} object accordingly.</p>
 * <p>The String representation should have been checked beforehand using
 * {@link #isStringRepresentation}.</p>
 * @static
 * @param {String} stringDefinition the String representation of the rectangular area (as
 *        created by {@link #serialize})
 * @return {CQ.form.ExtendedImageMap.RectArea} The rectangular area created; null, if the
 *         string definition is not correct
 */
CQ.form.ExtendedImageMap.RectArea.deserialize = function(stringDefinition) {
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
    return new CQ.form.ExtendedImageMap.RectArea({ },
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
 * @class CQ.form.ExtendedImageMap.CircularArea
 * @extends CQ.form.ExtendedImageMap.Area
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
CQ.form.ExtendedImageMap.CircularArea = CQ.Ext.extend(CQ.form.ExtendedImageMap.Area, {

    constructor: function(config, x, y, radius) {
        CQ.form.ExtendedImageMap.RectArea.superclass.constructor.call(this,
                CQ.form.ExtendedImageMap.AREATYPE_CIRCLE, config);
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
        var distance = CQ.form.ExtendedImageMap.Helpers.calculateDistanceToCircle(this, coords);
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
     *        imageSize, zoomedSize (see {@link CQ.form.ExtendedSmartImage.Shape#draw})
     */
    draw: function(ctx, zoom, offsets) {
        CQ.Log.debug("CQ.form.ExtendedImageMap.CircularArea#paint: Started.");
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
        CQ.Log.debug("CQ.form.ExtendedImageMap.CircularArea#paint: Finished.");
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
        var coordDef = CQ.form.ExtendedImageMap.Helpers.parseCoordinateString(coordStr);
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
CQ.form.ExtendedImageMap.CircularArea.isStringRepresentation = function(strToCheck) {
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
 * {@link CQ.form.ExtendedImageMap.CircularArea} object accordingly.</p>
 * <p>The specified string representation should have been checked beforehand using
 * {@link #isStringRepresentation}.</p>
 * @static
 * @param {String} stringDefinition The String representation of the polygonal area (as
 *        created by {@link #serialize})
 * @return {CQ.form.ExtendedImageMap.CircularArea} The image map created; null, if the string
 *         definition is not correct
 */
CQ.form.ExtendedImageMap.CircularArea.deserialize = function(stringDefinition) {
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
    return new CQ.form.ExtendedImageMap.CircularArea({ },
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
 * @class CQ.form.ExtendedImageMap.PolyArea
 * @extends CQ.form.ExtendedImageMap.Area
 * @private
 * This class represents a polygonal area of the image map.
 * @constructor
 * Creates a new ImageMap.PolyArea.
 * @param {Object} config The config object
 * @param {Number} x1 horizontal coordinate of first polygon point
 * @param {Number} y1 vertical coordinate of first polygon point
 */
CQ.form.ExtendedImageMap.PolyArea = CQ.Ext.extend(CQ.form.ExtendedImageMap.Area, {

    constructor: function(config, x1, y1) {
        CQ.form.ExtendedImageMap.RectArea.superclass.constructor.call(this,
                CQ.form.ExtendedImageMap.AREATYPE_POLYGON, config);
        this.areaType = CQ.form.ExtendedImageMap.AREATYPE_POLYGON;
        this.destination = new CQ.form.ExtendedImageMap.AreaDestination();
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
        CQ.form.ExtendedImageMap.Helpers.compactArray(this.points);
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
        var distance = CQ.form.ExtendedImageMap.Helpers.calculateDistance(
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
                CQ.Log.info("CQ.form.ExtendedImageMap.PolyArea#cleanUp: Polygon point with identical coordinates removed: " + p1.x + "/" + p1.y);
            }
        }
        CQ.form.ExtendedImageMap.Helpers.compactArray(this.points);
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
        CQ.form.ExtendedImageMap.PolyArea.superclass.onUnSelect.call(this);
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
        CQ.form.ExtendedImageMap.PolyArea.superclass.onDragStart.call(this);
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
     *        imageSize, zoomedSize (see {@link CQ.form.ExtendedSmartImage.Shape#draw})
     */
    draw: function(ctx, zoom, offsets) {
        CQ.Log.debug("CQ.form.ExtendedImageMap.PolyArea#paint: Started.");
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
        CQ.Log.debug("CQ.form.ExtendedImageMap.PolyArea#paint: Finished.");
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
        var coordDef = CQ.form.ExtendedImageMap.Helpers.parseCoordinateString(coordStr);
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
CQ.form.ExtendedImageMap.PolyArea.isStringRepresentation = function(strToCheck) {
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
 * {@link CQ.form.ExtendedImageMap.PolyArea} object accordingly.</p>
 * <p>The specified String representation should have been checked beforehand using
 * {@link #isStringRepresentation}.</p>
 * @static
 * @param {String} stringDefinition The String representation of the polygonal area (as
 *        created by {@link #serialize})
 * @return {CQ.form.ExtendedImageMap.PolyArea} The polygonal area created; null, if the
 *         string definition is not correct
 */
CQ.form.ExtendedImageMap.PolyArea.deserialize = function(stringDefinition) {
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
    var theArea = new CQ.form.ExtendedImageMap.PolyArea({ },
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
 * @class CQ.form.ExtendedImageCrop
 * @extends CQ.form.ExtendedSmartImage.ExtendedTool
 * @private
 * The ImageCrop provides the image crop tool for the
 * smart image component.
 * @constructor
 * Creates a new ImageCrop.
 * @param {String} transferFieldName name of the form field that is used for transferring
 *        the image crop information
 */
CQ.form.ExtendedImageCrop = CQ.Ext.extend(CQ.form.ExtendedSmartImage.ExtendedTool, {

    /**
     * The shape that represents the cropping rectangle visually
     * @private
     * @type CQ.form.ExtendedImageCrop.CropRect
     */
    cropRect: null,

    /**
     * The definition of the cropping rectangle as parsed by deserialization; properties:
     * x, y, width, height
     * @private
     * @type Object
     */
    cropRectDef: null,

    /**
     * The definition of the aspect ratio as parsed by deserialization; defined as a
     * two-value, comma-separated string
     * @private
     * @type String
     */
    aspectRatioDef: null,


    constructor: function(transferFieldName) {
        CQ.form.ExtendedImageCrop.superclass.constructor.call(this, {
            "toolId": "smartimageCrop",
            "toolName": CQ.I18n.getMessage("Crop"),
            "iconCls": "cq-image-icon-crop",
            "isCommandTool": false,
            "userInterface": new CQ.form.ExtendedImageCrop.UI( {
                "title": CQ.I18n.getMessage("Image crop tools")
            }),
            "transferFieldName": transferFieldName,
            "cropMinWidth": 32,
            "cropMinHeight": 32
        });
        this.cropRectDef = null;
        this.aspectRatioDef = null;
    },

    /**
     * Initializes the tool by setting available aspect ratios and propagating them to the
     * UI.
     * @param {Object} config configuration of the parent {@link CQ.form.ExtendedSmartImage}
     *        component
     */
    initialize: function(config) {
        // todo check compatibility with legacy implementation
        if (config.cropConfig) {
            this.aspectRatios = config.cropConfig.aspectRatios;
        }
        this.userInterface.updateAspectRatios(this.aspectRatios);
    },

    /**
     * Initializes the tool's components by registering the underlying
     * {@link CQ.form.ExtendedSmartImage.ImagePanel} and all necessary event handlers.
     * @param {CQ.form.ExtendedSmartImage} imageComponent The underlying smart image component
     */
    initComponent: function(imageComponent) {
        CQ.form.ExtendedImageMap.superclass.initComponent.call(this, imageComponent);
        this.workingArea = this.imageComponent.getImagePanel();
        this.workingArea.on("contentchange", this.onContentChange, this);
        this.workingArea.on("dragchange", function(shapes) {
            var hasCroppingChanged = (shapes.length == 1) && (shapes[0] == this.cropRect);
            if (hasCroppingChanged) {
                this.imageComponent.invalidateProcessedImages();
                var changeDef = {
                    "changeType": "crop",
                    "newValue": {
                        "x": this.cropRect.x,
                        "y": this.cropRect.y,
                        "width": this.cropRect.width,
                        "height": this.cropRect.height
                    }
                };
                this.workingArea.fireEvent("contentchange", changeDef);
                this.workingArea.fireEvent("smartimage.contentchange", changeDef); // deprecated as of 5.3
            }
        }, this);
    },

    /**
     * Handler that is called when the image crop tool is activated.
     */
    onActivation: function() {
        CQ.form.ExtendedImageCrop.superclass.onActivation.call(this);
        this.workingArea.hideAllShapeSets(false);
        if (!this.isInitialized) {
            this.cropShapeSet = new CQ.form.ExtendedSmartImage.ShapeSet(
                    CQ.form.ExtendedImageCrop.SHAPESET_ID);
            this.workingArea.addShapeSet(this.cropShapeSet);
            this.isInitialized = true;
        }
        if (this.initialValue != null) {
            this.deserialize(this.initialValue);
            this.initialValue = null;
        }
        var originalImage = this.imageComponent.getSuitableImage(true);
        if (originalImage) {
            this.workingArea.ignoreRotation = true;
            this.workingArea.updateImage(originalImage);
            this.initializeEdit();
            this.imageComponent.resetZoomSlider();
        }
        this.userInterface.isActive = true;
        this.workingArea.setShapeSetVisible(CQ.form.ExtendedImageCrop.SHAPESET_ID, true, true);
    },

    /**
     * Initializes editing an image by creating the crop rect shape if necessary and
     * initializing it correctly by calculating a suitable size that matches the aspect
     * ratio (managed by the user interface instance) and drawing the working area
     * accordingly.
     * @private
     */
    initializeEdit: function() {
        var mustAddShape = false;
        if (this.cropRect == null) {
            mustAddShape = true;
            this.cropRect = new CQ.form.ExtendedImageCrop.CropRect({
                    "cropMinWidth": this.cropMinWidth,
                    "cropMinHeight": this.cropMinHeight
                }, null, null, null, null);
            this.userInterface.notifyWorkingArea(this.workingArea, this.cropRect);
        }
        if (this.cropRectDef != null) {
            this.cropRect.x = this.cropRectDef.x;
            this.cropRect.y = this.cropRectDef.y;
            this.cropRect.width = this.cropRectDef.width;
            this.cropRect.height = this.cropRectDef.height;
        } else {
            this.cropRect.x = 0;
            this.cropRect.y = 0;
            this.userInterface.calculateInitialCropSize();
        }
        this.userInterface.setAspectRatioUI(this.aspectRatioDef);
        if (mustAddShape) {
            this.cropShapeSet.addShape(this.cropRect);
        } else {
            this.workingArea.drawImage();
        }
    },

    /**
     * Handler that is called when the image crop tool is deactivated.
     */
    onDeactivation: function() {
        this.userInterface.isActive = false;
        this.workingArea.setShapeSetVisible(CQ.form.ExtendedImageCrop.SHAPESET_ID, false, false);
        var processedImage = this.imageComponent.getSuitableImage();
        if (processedImage) {
            this.workingArea.ignoreRotation = false;
            this.workingArea.updateImage(processedImage);
            this.imageComponent.resetZoomSlider();
        }
        CQ.form.ExtendedImageCrop.superclass.onDeactivation.call(this);
    },

    /**
     * <p>Clears the current cropping information.</p>
     * <p>The view is not updated.</p>
     */
    clearCroppingInformation: function() {
        this.cropRectDef = null;
        this.initialValue = null;
    },

    /**
     * <p>Resets the aspect ratio.</p>
     * <p>The view is not updated.</p>
     */
    resetAspectRatio: function() {
        this.aspectRatioDef = null;
        this.userInterface.setAspectRatioUI(null);
    },

    /**
     * Handler that removes cropping information when a new image gets uploaded/referenced.
     */
    onImageUploaded: function() {
        this.clearCroppingInformation();
        this.resetAspectRatio();
        CQ.form.ExtendedImageCrop.superclass.onImageUploaded.call(this);
    },

    /**
     * Handler that removes cropping information when the image gets flushed.
     */
    onImageFlushed: function() {
        this.clearCroppingInformation();
        this.resetAspectRatio();
        CQ.form.ExtendedImageCrop.superclass.onImageFlushed.call(this);
    },

    /**
     * <p>Handler that reacts on "smartimage.contentchange" events.</p>
     * <p>Currently, no external content changes are supported.</p>
     * @param {Object} contentChangeDef The definition of the content change to handle
     */
    onContentChange: function(contentChangeDef) {
        if (contentChangeDef.changeType == "rotate") {
            // todo maybe later??
        }
    },

    /**
     * <p>Creates a string representation of the current cropping rectangle.</p>
     * <p>The value created is used by {@link CQ.form.ExtendedImageCrop#getValue}.</p>
     * @return {String} A string representation of the cropping rectangle (format:
     *         &lt;x&lt;,&lt;y&gt;,&lt;width&gt;,&lt;height&gt;)
     */
    serialize: function() {
        if (!this.isInitialized) {
            return null;
        }
        var ratioStr = "";
        var aspectRatio = this.userInterface.aspectRatio;
        if ((aspectRatio != null) && (aspectRatio != "0,0")) {
            ratioStr = "/" + aspectRatio;
        }
        if (this.cropRect == null) {
            return ratioStr;
        }
        return this.cropRect.x + "," + this.cropRect.y + ","
                + (this.cropRect.x + this.cropRect.width) + ","
                + (this.cropRect.y + this.cropRect.height) + ratioStr;
    },

    /**
     * <p>Sets the current cropping rectangle from the specified string representation (as
     * created by {@link #serialize}).
     * <p>The method is used by {@link CQ.form.ExtendedImageCrop#setValue}.</p>
     * @param {String} cropDefStr a string representation of the cropping rectangle (format:
     *        &lt;x&lt;,&lt;y&gt;,&lt;width&gt;,&lt;height&gt;); if null or an empty string
     *        is specified, the cropping rectangle will be set to cover the whole image
     */
    deserialize: function(cropDefStr) {
        this.cropRectDef = null;
        this.aspectRatioDef = null;
        if ((cropDefStr == null) || (cropDefStr.length == 0)) {
            return;
        }
        var aspectStr = null;
        var ratioPos = cropDefStr.indexOf("/");
        if ((ratioPos >= 0) && (cropDefStr.length > (ratioPos + 1))) {
            aspectStr = cropDefStr.substring(ratioPos + 1, cropDefStr.length);
            cropDefStr = cropDefStr.substring(0, ratioPos);
        }
        this.aspectRatioDef = aspectStr;
        var parts = cropDefStr.split(",");
        if (parts.length == 4) {
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            this.cropRectDef = {
                "x": x,
                "y": y,
                "width": parseInt(parts[2]) - x,
                "height": parseInt(parts[3]) - y
            };
        }
    }

});

/**
 * Shape set ID to be used by image crop.
 * @static
 * @final
 * @type String
 * @private
 */
CQ.form.ExtendedImageCrop.SHAPESET_ID = "smartimage.imagecrop";
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
 * @class CQ.form.ExtendedImageCrop.UI
 * @extends CQ.form.ExtendedSmartImage.ExtendedTool.UserInterface
 * @private
 * The ImageCrop.UI provides the external user interface of the
 * image crop tool.
 * @constructor
 * Creates a new ImageCrop.UI
 * @param {Object} config The config object
 */
CQ.form.ExtendedImageCrop.UI = CQ.Ext.extend(CQ.form.ExtendedSmartImage.ExtendedTool.UserInterface, {

    /**
     * Flag if the tool is currently active (managed by {@link CQ.form.ExtendedImageCrop})
     * @private
     * @type Boolean
     */
    isActive: false,

    /**
     * Reference to the {@link CQ.form.ExtendedSmartImage.ImagePanel} the tool is working on
     * @private
     * @type CQ.form.ExtendedSmartImage.ImagePanel
     */
    workingArea: null,

    /**
     * @cfg {Number} cropMinWidth
     * Minimum width of the cropping rectangle
     */
    cropMinWidth: 0,

    /**
     * @cfg {Number} cropMinHeight
     * Minimum height of the cropping rectangle
     */
    cropMinHeight: 0,

    /**
     * The currently selected aspect ratio
     * @private
     * @type String
     */
    aspectRatio: null,

    constructor: function(config) {
        this.aspectRatioText = CQ.I18n.getMessage("Aspect ratio");
        this.aspectRatioMenu = new CQ.Ext.menu.Menu( {
            "items": [
            ]
        } );
        this.toolbar = new CQ.Ext.Toolbar( {
            "itemId": "toolbar",
            "items": [ {
                "itemId": "ratio",
                "text": this.aspectRatioText,
                "menu": this.aspectRatioMenu
            } ]
        } );
        var defaults = {
            "items": [
                this.toolbar
            ],
            "width": CQ.themes.SmartImage.Tool.CROP_TOOLS_WIDTH,
            "cropMinWidth": 32,
            "cropMinHeight": 32
        };
        CQ.Util.applyDefaults(config, defaults);
        CQ.form.ExtendedImageCrop.UI.superclass.constructor.call(this, config);
    },

    /**
     * This method is used by the tool to inform the UI implementation about the image
     * panel and the shape set it is working on.
     * @param {CQ.form.ExtendedSmartImage.ImagePanel} workingArea The image panel
     * @param {CQ.form.ExtendedSmartImage.Shape} cropRect The shape set
     */
    notifyWorkingArea: function(workingArea, cropRect) {
        this.workingArea = workingArea;
        this.cropRect = cropRect;
        if (this.initialRatio) {
            var ratio = this.parseRatioFromString(this.initialRatio);
            this.defineRatio(ratio[0], ratio[1]);
        } else {
            this.cropRect.ratio = null;
        }
    },


    // UI-related stuff --------------------------------------------------------------------

    /**
     * <p>Updates the aspect ratio drop down with the specified list of predefined aspect
     * ratios.</p>
     * <p>todo Describe behaviour of "free ratio"</p>
     * @param {Object} ratios predefined aspect ratios; keys may be chosen arbitrarily;
     *        each ratio should have at least a value and a text property; a ratio can be
     *        preselected by adding a checked property that is set to true
     */
    updateAspectRatios: function(ratios) {
        this.aspectRatioMenu.removeAll();
        if (!ratios) {
            ratios = {
                "freeCrop": {
                    "value": "0,0",
                    "text": CQ.I18n.getMessage("Free crop")
                }
            };
        }
        var menuItems = [ ];
        var freeRatio, ratioChecked;
        for (var ratio in ratios) {
            if (ratios.hasOwnProperty(ratio)) {
                var ratioToProcess = ratios[ratio];
                if (ratioToProcess.value && ratioToProcess.text) {
                    var isRatio = ratioToProcess.checked;
                    var itemToAdd = {
                        "text": ratioToProcess.text,
                        "value": ratioToProcess.value,
                        "checked": isRatio,
                        "group": "aspectRatio",
                        "handler": function(item, checked) {
                            if (checked) {
                                this.onRatioChanged(item.value, item.text);
                            }
                        }.createDelegate(this)
                    };
                    if (isRatio) {
                        ratioChecked = itemToAdd;
                    }
                    menuItems.push(itemToAdd);
                    if (ratioToProcess.value == "0,0") {
                        freeRatio = itemToAdd;
                    }
                }
            }
        }
        if (!ratioChecked && freeRatio) {
            freeRatio.checked = true;
            ratioChecked = freeRatio;
        }
        if (ratioChecked) {
            var ratioName = ratioChecked.text;
            this.toolbar.items.get("ratio").setText(
                    this.aspectRatioText + ": " + ratioName);
        }
        var itemsToAddCnt = menuItems.length;
        for (var itemIndex = 0; itemIndex < itemsToAddCnt; itemIndex++) {
            this.aspectRatioMenu.addItem(new CQ.Ext.menu.CheckItem(menuItems[itemIndex]));
        }
        this.initialRatio = null;
        if (ratioChecked) {
            this.initialRatio = ratioChecked.value;
            this.aspectRatio = ratioChecked.value;
        }
    },

    /**
     * Sets the aspect ratio to the specified value without changing the crop rect visually,
     * but setting up the UI accordingly. Additionally, the ratio of the cropping rectangle
     * is adjusted correctly. Use this method if you are sure that the current extension
     * of the cropping rect matches the aspect ratio and want to ensure correct setting of
     * the editing environment.
     * @param {String} ratioToSet String representation of the ratio to set
     */
    setAspectRatioUI: function(ratioToSet) {
        if ((ratioToSet == null) || (ratioToSet.length == 0)) {
            ratioToSet = "0,0";
        }
        this.aspectRatio = null;
        var items = this.aspectRatioMenu.items;
        items.each(function(item) {
            if (item.value == ratioToSet) {
                item.setChecked(true, true);
                this.toolbar.items.get("ratio").setText(
                        this.aspectRatioText + ": " + item.text);
                this.aspectRatio = ratioToSet;
            }
        }, this);
        if (this.aspectRatio == null) {
            this.defineRatio(0, 0);
        } else {
            var ratio = this.parseRatioFromString(this.aspectRatio);
            this.defineRatio(ratio[0], ratio[1]);
        }
    },

    /**
     * Handles if a new ratio has been selected by the user from the corresponding
     * drop down menu.
     * @param {String} ratioValue serialized value (format: x,y)
     * @param {String} ratioName name of the ratio selected
     */
    onRatioChanged: function(ratioValue, ratioName) {
        this.aspectRatio = ratioValue;
        var ratio = this.parseRatioFromString(ratioValue);
        this.changeAspectRatio(ratio[0], ratio[1]);
        this.toolbar.items.get("ratio").setText(this.aspectRatioText + ": " + ratioName);
    },


    // Aspect ratio calculation ------------------------------------------------------------

    /**
     * <p>Calculates the initial size of the cropping rectangle that may be used when no
     * cropping rectangle is defined yet.</p>
     * <p>The size is calculated using the image width as a reference. If no fixed ratio is
     * defined, the initial cropping rectangle extends to the whole image. Otherwise,
     * it uses the best approach to fit to the currently set aspect ratio.</p>
     * @param {Object} imageSize The (original) image size; properties: width, height
     * @private
     */
    calculateInitialCropSize: function(imageSize) {
        if (!imageSize) {
            imageSize = this.workingArea.originalImageSize;
        }
        if (this.cropRect.ratio != null) {
            var ratioCoords = this.applyRatio(imageSize.width);
            this.cropRect.width = ratioCoords.width;
            this.cropRect.height = ratioCoords.height;
        } else {
            this.cropRect.width = imageSize.width;
            this.cropRect.height = imageSize.height;
        }
    },

    /**
     * <p>Changes the aspect ratio.</p>
     * <p>If there is an existing cropping rectangle and the specified aspect ratio is
     * different from "free", the cropping rectangle will be adjusted accordingly (using the
     * existing width as primary reference. The method ensures that the adjusted cropping
     * rectangle does not exceed the image's bounds.</p>
     * @param {Number} xRatio horizontal aspect ratio
     * @param {Number} yRatio vertical aspect ratio
     */
    changeAspectRatio: function(xRatio, yRatio) {
        if (xRatio !== undefined) {
            this.xRatio = xRatio;
        }
        if (yRatio !== undefined) {
            this.yRatio = yRatio;
        }
        if ((this.xRatio != 0) && (this.yRatio != 0)) {
            this.cropRect.ratio = this.xRatio / this.yRatio;
            var ratioCoords = this.applyRatio(this.cropRect.width);
            this.cropRect.width = ratioCoords.width;
            this.cropRect.height = ratioCoords.height;
            // todo adjust
            // this.selector.setSize(this.cropWidth, this.cropHeight);
        } else {
            this.cropRect.ratio = null;
        }
        this.workingArea.drawImage();
    },

    /**
     * <p>Applies the currently set aspect ratio to the specified width.</p>
     * <p>Note that the {@link #ratio} property must not be null if this method is called.
     * </p>
     * @param {Number} width The width to apply ratio to
     * @return {Object} Object containing the actual width and height after applying the
     *         aspect ratio; properties: width, height
     * @private
     */
    applyRatio: function(width) {
        var imageSize = this.workingArea.originalImageSize;
        var height = Math.round(width / this.cropRect.ratio);
        if ((height + this.cropRect.y) > imageSize.height) {
            height = imageSize.height - this.cropRect.y;
            width = Math.round(height * this.cropRect.ratio);
        }
        return {
            "width": width,
            "height": height
        };
    },

    /**
     * Defines an aspect ratio without propagating the new aspect ratio to the view
     * (only properties {@link #xRatio} and {@link #yRatio} will be set and the new value of
     * {@link #ratio} will be calculated).
     * @param {Number} ratioX The horizontal aspect ratio
     * @param {Number} ratioY The vertical aspect ratio
     */
    defineRatio: function(ratioX, ratioY) {
        this.xRatio = ratioX;
        this.yRatio = ratioY;
        this.calcCropRectRatio();
    },

    /**
     * Calculates the ratio setting for the cropping rectangle from current settings
     * (member properties this.xRatio, this.yRatio).
     */
    calcCropRectRatio: function() {
        if (this.cropRect != null) {
            if ((this.xRatio > 0) || (this.yRatio > 0)) {
                this.cropRect.ratio = this.xRatio / this.yRatio;
            } else {
                this.cropRect.ratio = null;
            }
        }
    },

    /**
     * <p>Parses an aspect ratio from the specified string representation.</p>
     * <p>Format of the string representation: &lt;horizontal value&gt;,&lt;vertical
     * value&gt;</p>
     * @param {String} ratioStr The string representation to parse
     */
    parseRatioFromString: function(ratioStr) {
        var ratio = [ 0, 0 ];
        var ratioParts = ratioStr.split(",");
        if (ratioParts.length == 2) {
            ratio[0] = parseInt(ratioParts[0]);
            ratio[1] = parseInt(ratioParts[1]);
        }
        return ratio;
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
 * @class CQ.form.ExtendedImageCrop.CropRect
 * @extends CQ.form.ExtendedSmartImage.Shape
 * @private
 * <p>The ImageCrop.CropRect provides the UI part of the cropping rectangle.</p>
 * <p>Currently, all ratio-related calculations are done based upon the current width of
 * the cropping rectancle. This is fine for ratios &gt;= 1, but may not provide the
 * expected user experience for ratios &lt; 1. In future releases, ratios &lt; 1 should
 * be calculated based on the current height.</p>
 * @constructor
 * Creates a new ImageCrop.CropRect
 * @param {Object} config configuration of the area
 * @param {Number} x horizontal offset of the cropping rect
 * @param {Number} y vertical offset of the cropping rect
 * @param {Number} width with of the cropping rect
 * @param {Number} height height of the cropping rect
 */
CQ.form.ExtendedImageCrop.CropRect = CQ.Ext.extend(CQ.form.ExtendedSmartImage.Shape, {

    /**
     * @cfg {String} rectColor The color of the rect
     */
    rectColor: null,

    /**
     * @cfg {String} invalidPartsBackground
     * The background color of excluded parts of the image; may be null if no background
     * color has to be used for excluded parts - todo format?
     */
    invalidPartsBackground: null,

    /**
     * @cfg {Number} handleDistance
     * Distance between handles and the cropping rectangle
     */
    handleDistance: 0,

    /**
     * @cfg {Number} handleSize
     * The size of handles
     */
    handleLength: 0,

    /**
     * @cfg {Number} handleThickness
     * "Thickness" of handles
     */
    handleThickness: 0,

    /**
     * @cfg {Number} cropMinWidth
     * Minimum width of the cropping rectangle
     */
    cropMinWidth: 0,

    /**
     * @cfg {Number} cropMinHeight
     * Minimum height of the cropping rectangle
     */
    cropMinHeight: 0,

    /**
     * Current aspect ration - todo properties?
     * @property
     * @type Object
     */
    ratio: null,

    /**
     * Current horizontal position of the cropping rect
     * @private
     * @type Number
     */
    x: 0,

    /**
     * Current vertical position of the cropping rect
     * @private
     * @type Number
     */
    y: 0,

    /**
     * Current width of the cropping rect
     * @private
     * @type Number
     */
    width: 0,

    /**
     * Current height of the cropping rect
     * @private
     * @type Number
     */
    height: 0,

    /**
     * Flag that determines if the sections should be drawn (usually during dragging the
     * rectangle)
     * @private
     * @type Boolean
     */
    drawSections: false,

    /**
     * Fixed coordinates - this is the point opposite to the point that is actually
     * dragged on resizing operations. It is required to correctly apply size and
     * coordinate restraints.
     * @private
     * @type Object
     */
    fixedCoordinates: null,


    // Lifecycle ---------------------------------------------------------------------------

    constructor: function(config, x, y, width, height) {
        var defaults = {
            "rectColor": CQ.themes.ImageCrop.CROP_RECT_COLOR,
            "invalidPartsBackground": CQ.themes.ImageCrop.BACKGROUND_INVALIDPARTS,
            "handleDistance": CQ.themes.ImageCrop.HANDLE_DISTANCE,
            "handleLength": CQ.themes.ImageCrop.HANDLE_LENGTH,
            "handleThickness": CQ.themes.ImageCrop.HANDLE_THICKNESS,
            "handleRollover": CQ.themes.ImageCrop.HANDLE_ROLLOVER
        };
        CQ.Util.applyDefaults(config, defaults);
        CQ.Ext.apply(this, config);
        CQ.form.ExtendedImageCrop.CropRect.superclass.constructor.call(this, config);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.drawSections = false;
    },


    // Interface implementation ------------------------------------------------------------

    /**
     * Checks if the specified coordinates are a "mouseover" for the cropping rectangle.
     * @param {Object} coords coordinates
     * @param {Number} tolerance tolerance distance
     * @return {Boolean} True if the shape is "touched" by the mouse
     */
    isTouched: function(coords, tolerance) {
        var handleId = this.calculateHandleId(coords);
        if (handleId != null) {
            return true;
        }
        coords = coords.unzoomedUnclipped;
        return (coords.x >= this.x) && (coords.x < (this.x + this.width))
            && (coords.y >= this.y) && (coords.y < (this.y + this.height));
    },

    /**
     * Checks if the specified coordinates are part of the visual handle defined by its
     * corner coordinates.
     * @param {Object} coords (mouse) coordinates to check
     * @param {Number} handleX horizontal coordinate of the handle's corner
     * @param {Number} handleY vertical coordinate of the handle's corner
     * @return {Boolean} True if the mouse coordinates are part of the handle
     */
    isPartOfHandle: function(coords, handleX, handleY) {
        var distance = this.calculateDistance(coords, { "x": handleX, "y": handleY });
        return distance < Math.ceil(this.handleLength / (coords.absoluteZoom + 1));
    },

    /**
     * Calculates the ID of the visual handle that is suitable for the specified
     * coordinates.
     * @param {Object} coords (mouse) coordinates to check
     * @return {String} ID of the suitable handle ("topleft", "topright", "bottomleft",
     *         "bottomright"); null if the mouse coordinates are not suitable for a handle
     */
    calculateHandleId: function(coords) {
        coords = coords.unzoomedUnclipped;
        var handleId = null;
        if (this.isPartOfHandle(coords, this.x, this.y)) {
            return "topleft";
        }
        if (this.isPartOfHandle(coords, this.x + this.width, this.y)) {
            return "topright";
        }
        if (this.isPartOfHandle(coords, this.x, this.y + this.height)) {
            return "bottomleft";
        }
        if (this.isPartOfHandle(coords, this.x + this.width, this.y + this.height)) {
            return "bottomright";
        }
        return handleId;
    },

    /**
     * Checks if the specified coordinates are directly draggable.
     * @param {Object} coords The coordinates to check; properties: x, y
     * @param {Number} tolerance The tolerance distance
     * @return {Boolean} True if the specified coordinates are directly draggable
     */
    isDirectlyDraggable: function(coords, tolerance) {
        return this.isTouched(coords);
    },

    /**
     * Moves the cropping rectangle or a suitable edge of it by the specified offsets.
     * @param {Number} xOffs The horizontal offset
     * @param {Number} yOffs The vertical offset
     * @param {Object} coords The actual coordinates
     * @return {Boolean} True if a redraw of the shape is required
     */
    moveShapeBy: function(xOffs, yOffs, coords) {
        var imageSize = coords.unzoomed.imageSize;
        if (this.pointToMove == null) {
            this.x = this.draggingReference.x + xOffs;
            this.y = this.draggingReference.y + yOffs;
            this.correctCoordinates(imageSize);
        } else {
            var newX = this.draggingReference.x + xOffs;
            if (newX < 0) {
                newX = 0;
            }
            if (newX >= imageSize.width) {
                newX = imageSize.width - 1;
            }
            var newY = this.draggingReference.y + yOffs;
            if (newY < 0) {
                newY = 0;
            }
            if (newY >= imageSize.height) {
                newY = imageSize.height - 1;
            }
            var xDelta, yDelta;
            if (this.pointToMove == "topleft") {
                xDelta = this.x - newX;
                this.x = newX;
                this.width += xDelta;
                yDelta = this.y - newY;
                this.y = newY;
                this.height += yDelta;
            } else if (this.pointToMove == "topright") {
                this.width = newX - this.x + 1;
                yDelta = this.y - newY;
                this.y = newY;
                this.height += yDelta;
            } else if (this.pointToMove == "bottomleft") {
                xDelta = this.x - newX;
                this.x = newX;
                this.width += xDelta;
                this.height = newY - this.y + 1;
            } else if (this.pointToMove == "bottomright") {
                this.width = newX - this.x + 1;
                this.height = newY - this.y + 1;
            }
            if (this.width < this.cropMinWidth) {
                this.width = this.cropMinWidth;
                this.correctXCoord();
            }
            if (this.height < this.cropMinHeight) {
                this.height = this.cropMinHeight;
                this.correctYCoord();
            }
            if (this.ratio != null) {
                this.height = Math.round(this.width / this.ratio);
                this.correctYCoord();
                var hasXChanged = false;
                if (this.x < 0) {
                    this.width += this.x;
                    this.x = 0;
                    hasXChanged = true;
                }
                if (hasXChanged) {
                    this.height = Math.round(this.width / this.ratio);
                    this.correctXCoord();
                    this.correctYCoord();
                }
                var hasYChanged = false;
                if (this.y < 0) {
                    this.height += this.y;
                    this.y = 0;
                    hasYChanged = true;
                }
                if ((this.y + this.height) > imageSize.height) {
                    this.height = imageSize.height - this.y;
                    hasYChanged = true;
                }
                if (hasYChanged) {
                    this.width = Math.round(this.height * this.ratio);
                    this.correctXCoord();
                    this.correctYCoord();
                }
            }
        }
        return true;
    },

    /**
     * <p>Corrects the x coordinate of the cropping rectangle if the width has been adjusted
     * programatically.</p>
     * <p>The x coordinate needs to be adjusted if the fixed point of the resize operation
     * is on the right side of the rectangle.</p>
     */
    correctXCoord: function() {
        if (this.fixedCoordinates.widthMult < 0) {
            this.x = this.fixedCoordinates.x - this.width;
        }
    },

    /**
     * <p>Corrects the y coordinate of the cropping rectangle if the height has been
     * adjusted programatically.</p>
     * <p>The y coordinate needs to be adjusted if the fixed point of the resize operation
     * represents the bottom of the crop rectangle.</p>
     */
    correctYCoord: function() {
        if (this.fixedCoordinates.heightMult < 0) {
            this.y = this.fixedCoordinates.y - this.height;
        }
    },

    /**
     * Corrects the cropping rectangle's coordinates to ensure that it doesn't exceed the
     * specified image size.
     * @param {Object} imageSize The image size to check; properties: width, height
     */
    correctCoordinates: function(imageSize) {
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.y < 0) {
            this.y = 0;
        }
        var xEnd = this.x + this.width;
        var yEnd = this.y + this.height;
        if (xEnd > imageSize.width) {
            this.x = imageSize.width - this.width;
            if (this.x < 0) {
                this.width += this.x;
                this.x = 0;
            }
        }
        if (yEnd > imageSize.height) {
            this.y = imageSize.height - this.height;
            if (this.y < 0) {
                this.height += this.y;
                this.y = 0;
            }
        }
    },

    /**
     * Handles the rollover of the cropping rectangle.
     * @param {Object} coords The mouse coordinates
     * @return {Boolean} True to trigger a redraw
     */
    onRollOver: function(coords) {
        this.handleId = this.calculateHandleId(coords);
        return true;
    },

    /**
     * Handles the rollout of the cropping rectangle.
     * @param {Object} coords The mouse coordinates
     * @return {Boolean} True to trigger a redraw
     */
    onRollOut: function(coords) {
        this.handleId = null;
        return true;
    },

    /**
     * Handles mouse moves inside the cropping rectangle
     * @param {Object} coords The mouse coordinates
     * @return {Boolean} True if a redraw is required
     */
    onRolledOver: function(coords) {
        var oldHandleId = this.handleId;
        this.handleId = this.calculateHandleId(coords);
        return (this.handleId != oldHandleId);
    },

    /**
     * This method is called when dragging starts.
     * @param {Object} coords The coordinates where dragging starts
     * @param {Number} tolerance The tolerance distance
     * @return {Boolean} True to trigger a redraw
     */
    onDragStart: function(coords, tolerance) {
        this.pointToMove = this.calculateHandleId(coords);
        if ((this.pointToMove == "topleft") || (this.pointToMove == null)) {
            this.draggingReference = {
                "x": this.x,
                "y": this.y
            };
            if (this.pointToMove != null) {
                this.fixedCoordinates = {
                    "x": this.x + this.width - 1,
                    "y": this.y + this.height - 1,
                    "widthMult": -1,
                    "heightMult": -1
                };
            }
        } else if (this.pointToMove == "topright") {
            this.draggingReference = {
                "x": this.x + this.width - 1,
                "y": this.y
            };
            this.fixedCoordinates = {
                "x": this.x,
                "y": this.y + this.height - 1,
                "widthMult": 1,
                "heightMult": -1
            };
        } else if (this.pointToMove == "bottomleft") {
            this.draggingReference = {
                "x": this.x,
                "y": this.y + this.height - 1
            };
            this.fixedCoordinates = {
                "x": this.x + this.width - 1,
                "y": this.y,
                "widthMult": -1,
                "heightMult": 1
            };
        } else if (this.pointToMove == "bottomright") {
            this.draggingReference = {
                "x": this.x + this.width - 1,
                "y": this.y + this.height - 1
            };
            this.fixedCoordinates = {
                "x": this.x,
                "y": this.y,
                "widthMult": 1,
                "heightMult": 1
            };
        }
        this.drawSections = true;
        return true;
    },

    /**
     * This method is called when dragging ends.
     * @param {Object} coords The coordinates where dragging ends
     * @param {Number} tolerance The tolerance distance
     * @return {Boolean} True to trigger a redraw
     */
    onDragEnd: function(coords, tolerance) {
        this.drawSections = false;
        return true;
    },

    /**
     * Redraws the cropping rectangle on the specified canvas context.
     * @param {CanvasRenderingContext2D} ctx The canvas context to be used for drawing
     * @param {Number} zoom The real zoom factor (1.0 means that the original size should be
     *        used)
     * @param {Object} offsets The offsets to be used for drawing; properties: srcX, srcY,
     *        destX, destY, imageSize, zoomedSize (see
     *        {@link CQ.form.ExtendedSmartImage.Shape#draw})
     */
    draw: function(ctx, zoom, offsets) {
        var coords = this.calculateDisplayCoords(zoom, offsets, this.x, this.y);
        var size = this.calculateDisplaySize(zoom, this.width, this.height);
        var x2 = coords.x + size.width;
        var y2 = coords.y + size.height;
        // draw area to be cut (invalid parts of the image; darkened)
        ctx.save();
        if (this.invalidPartsBackground) {
            ctx.fillStyle = this.invalidPartsBackground;
            var imageSize = offsets.imageSize;
            var imageStartCoords = this.calculateDisplayCoords(zoom, offsets, 0, 0);
            var imageEndCoords = this.calculateDisplayCoords(
                zoom, offsets, imageSize.width, imageSize.height);
            var xS = imageStartCoords.x;
            var yS = imageStartCoords.y;
            var xE = imageEndCoords.x;
            var yE = imageEndCoords.y;
            if (coords.x > 0) {
                ctx.fillRect(xS, yS, coords.x - xS, yE - yS);
            }
            if (coords.y > 0) {
                ctx.fillRect(coords.x, yS, size.width, coords.y - yS);
            }
            var yTemp = coords.y + size.height;
            if (yTemp < yE) {
                ctx.fillRect(coords.x, yTemp, size.width, yE - yTemp);
            }
            var xTemp = coords.x + size.width;
            if (xTemp < xE) {
                ctx.fillRect(xTemp, yS, xE - xTemp, yE - yS);
            }
        }
        ctx.restore();
        // draw cropping rect
        ctx.strokeStyle = this.rectColor;
        if (this.drawSections) {
            ctx.beginPath();
            var sY = (size.height / 3);
            ctx.moveTo(coords.x, coords.y + sY);
            ctx.lineTo(x2, coords.y + sY);
            ctx.moveTo(coords.x, coords.y + 2 * sY);
            ctx.lineTo(x2, coords.y + 2 * sY);
            var sX = (size.width / 3);
            ctx.moveTo(coords.x + sX, coords.y);
            ctx.lineTo(coords.x + sX, y2);
            ctx.moveTo(coords.x + 2 * sX, coords.y);
            ctx.lineTo(coords.x + 2 * sX, y2);
            ctx.stroke();
        }
        ctx.lineWidth = 1;
        ctx.strokeRect(coords.x, coords.y, size.width, size.height);
        ctx.lineWidth = this.handleThickness;
        var sizeOffs = this.handleLength - this.handleDistance;
        ctx.beginPath();
        ctx.strokeStyle =
            (this.handleId == "topleft" ? this.handleRollover : this.rectColor);
        ctx.moveTo(coords.x - this.handleDistance, coords.y + sizeOffs);
        ctx.lineTo(coords.x - this.handleDistance, coords.y - this.handleDistance);
        ctx.lineTo(coords.x + sizeOffs, coords.y - this.handleDistance);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle =
            (this.handleId == "topright" ? this.handleRollover : this.rectColor);
        ctx.moveTo(x2 + this.handleDistance, coords.y + sizeOffs);
        ctx.lineTo(x2 + this.handleDistance, coords.y - this.handleDistance);
        ctx.lineTo(x2 - sizeOffs, coords.y - this.handleDistance);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle =
            (this.handleId == "bottomleft" ? this.handleRollover : this.rectColor);
        ctx.moveTo(coords.x - this.handleDistance, y2 - sizeOffs);
        ctx.lineTo(coords.x - this.handleDistance, y2 + this.handleDistance);
        ctx.lineTo(coords.x + sizeOffs, y2 + this.handleDistance);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle =
            (this.handleId == "bottomright" ? this.handleRollover : this.rectColor);
        ctx.moveTo(x2 + this.handleDistance, y2 - sizeOffs);
        ctx.lineTo(x2 + this.handleDistance, y2 + this.handleDistance);
        ctx.lineTo(x2 - sizeOffs, y2 + this.handleDistance);
        ctx.stroke();
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
 * @class CQ.form.PathField
 * @extends CQ.Ext.form.ComboBox
 * <p>The PathField is an input field designed for paths with path completion
 * and a button to open a {@link CQ.BrowseDialog} for browsing the server
 * repository. It can also browse page paragraphs for advanced link generation.</p>
 * <p>The default configuration is for browsing pages below /content. Here are
 * some other typical configs:</p>
 * <ul>
 * <li>Full repository browsing, showing node names, not titles
<pre><code>
var pathfield = new CQ.form.PathField({
    rootPath: "/",
    predicate: "nosystem",
    showTitlesInTree: false
});
</code></pre>
 * </li>
 * <li>Browsing only a subtree
<pre><code>
var pathfield = new CQ.form.PathField({
    rootPath: "/content/dam",
    showTitlesInTree: false
});
</code></pre>
 * </li>
 * <li>Paragraph browsing (with custom link patterns)
<pre><code>
var pathfield = new CQ.form.PathField({
    parBrowse: true,
    linkPattern: "{0}.selector.html",
    parLinkPattern: "{0}.selector.html#{1}"
});
</code></pre>
 * </li>
 * <li>Only (fast) path completion, but no browse dialog
<pre><code>
var pathfield = new CQ.form.PathField({
    hideTrigger: true,
    searchDelay: 100
});
</code></pre>
 * </li>
 * </ul>
 * @constructor
 * Creates a new PathField.
 * @param {Object} config The config object
 */
CQ.form.LinkDialog = CQ.Ext.extend(CQ.Ext.form.ComboBox, {
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
            "ok" : function() {
            	this.hide();
            },
            "items" : {
                "xtype" : "tabpanel",
                "items" : [{
                	"title" : "Link Tab",
                	"xtype" : "panel",
                	"items" : [{
                		"xtype" : "fieldset",
                		"title" : "Link",
                		"items" : [{
                			"fieldLabel" : "Link Title",
                			"fieldDescription" : "Enter an alternative link title here to add information about the nature of a link. Link titles will be shown in a tool tip. Please note: Do not put pipes in the link title.",
                			"itemId" : "extendedLinkTitle",
                            "name" : "./linkTitle",
                            "width" : 278,
                            "xtype" : "textfield"
                		}, {
                			"fieldLabel" : "Internal Link",
                			"name" : "./internalLink",
                			"itemId" : "extendedInternalLink",
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
                			"itemId" : "extendedDeepLinkParam",
                			"name" : "./deeplinkParam",
                			"options" : [{
                            	text : '- No deeplink targets available -',
                            	value : ''
                			}],
                			"type" : "select",
                			"xtype" : "selection"
                		}, {
                			"fieldLabel" : "In-page Link",
                			"itemId" : "extendedInPageLink",
                			"name" : "./inPageLink",
                			"options" : [{
                				text : '- No in page links available -',
                        		value : ''
                			}],
                			"type" : "select",
                			"xtype" : "selection"
                		}, {
                			"fieldLabel" : "Disclaimer Link",
                			"itemId" : "extendedDisclaimerLink",
                			"fieldDescription" : "Choose a page, bodystyle, or general disclaimer to present as an in-page layer.",
                			"name" : "./disclaimer",
                			"options" :  pagePath +".all-disclaimers.json", 
                			"type" : "select",
                			"xtype" : "selection"
                		}, {
                			"fieldLabel" : "Glossary Link",
                			"itemId" : "extendedGlossaryLink",
                			"fieldDescription" : "Choose a Glossary Item, that should be presented as an in-page layer.",
                			"name" : "./glossaryLink",
                			"options" : pagePath + ".all-glossary-items.json", 
                			"type" : "select",
                			"xtype" : "selection"
                		
                		}, {
                			"fieldLabel" : "External Link",
                			"fieldDescription" : "External links can only be inserted from the External Link Library.",
                			"itemId" : "extendedExternalLink",
                			"name" : "./externalLink",
                			"width" : 278,
                			"xtype" : "browsefield"
                		}, {
                			"fieldLabel" : "Link Parameters",
                			"fieldDescription" : "Choose a link parameter by clicking on \'+\'. If you have chosen a \'request parameter without fixed value\', you can type the value in the textfield after the \'=\'.",
                			"name" : "./link_params",
                			"itemId" : "extendedLinkParams",
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
                	}]
                }]
            }
        };
        // build the dialog and load its contents
        this.dialog = new CQ.Dialog(dialogConfig);
        var linkFieldset = this.dialog.items.itemAt(0).items.itemAt(0).items.itemAt(0).items;
        // actually sets the options since the ones above are dummy options. could not do optionsProvider or optionsCallback because you can't
        // access the dialog before it has been loaded
        linkFieldset.get("extendedDeepLinkParam").setOptions( gmdsGetDeepLinkOpts().getDeepLinkParam(linkFieldset.get("extendedInternalLink")));
        linkFieldset.get("extendedInPageLink").setOptions( gmdsInPageOpts().getLinks(linkFieldset.get("extendedInternalLink")));
        CQ.form.LinkDialog.superclass.constructor.call(this, config);
    },
    
    initComponent : function(){
        CQ.form.LinkDialog.superclass.initComponent.call(this);
    }
    
    // add setValue, getValue, getRawValue here in the future for other components
});

CQ.Ext.reg("linkdialog", CQ.form.LinkDialog);

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
 * @class CQ.form.MultiField
 * @extends CQ.form.CompositeField
 * The MultiField is an editable list of form fields for editing
 * multi-value properties.
 * @constructor
 * Creates a new MultiField.
 * @param {Object} config The config object
 */
CQ.form.HotspotMultiField = CQ.Ext.extend(CQ.form.CompositeField, {

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
                "xtype":"hotspotmultifielditem",
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
        CQ.form.HotspotMultiField.superclass.constructor.call(this,config);
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
        CQ.form.HotspotMultiField.superclass.initComponent.call(this);

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
                if (item instanceof CQ.form.HotspotMultiField.Item) {
                    item.field.disable();
                }
            }, this);
        });

        this.on("enable", function() {
            this.hiddenDeleteField.enable();
            if (this.typeHintField) this.typeHintField.enable();
            this.items.each(function(item/*, index, length*/) {
                if (item instanceof CQ.form.HotspotMultiField.Item) {
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
        if(this.findParentByType("tabpanel").items.items[0].items.items[0].getValue() === 'advanced' && this.findParentByType("tabpanel").items.items[0].items.items[6].items.items[1].getValue()[0] === 'true') {
			h.setVisibleByClass('x-panel-hotspot-image', parent, false);
		} else {
			h.setVisibleByClass('x-panel-hotspot-image', parent, true); 
        }
        
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
            if (item instanceof CQ.form.HotspotMultiField.Item) {
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
            if (item instanceof CQ.form.HotspotMultiField.Item) {
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

CQ.Ext.reg("hotspotmultifield", CQ.form.HotspotMultiField);

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
CQ.form.HotspotMultiField.Item = CQ.Ext.extend(CQ.Ext.Panel, {

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
        CQ.form.HotspotMultiField.Item.superclass.constructor.call(this, config);

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

CQ.Ext.reg("hotspotmultifielditem", CQ.form.HotspotMultiField.Item);

/**
 * @class HotspotItem
 * @extends CQ.form.CompositeField
 * Allows the user to select the following:
 *    - a path or enter in an external URL
 *    - override the title or set a title for the external URL
 *    - select an image to be used for the link
 * @constructor
 * Creates a new HotspotItem
 * @param {Object} config The config object
 */
CQ.form.HotspotItem = CQ.Ext.extend(CQ.form.CompositeField, {

	hiddenField: null,
	
    xvalue: null,
    
    yvalue: null,
    
    captionText: null,
    
    captionAlign: null,
    
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
	        	"autoWidth" : true,
	        	"xtype" : "selection",
	        	"fieldLabel" : "Caption Alignment",
	        	"labelStyle" : "display:block; width: 130px;",
	        	"defaultValue" : "Top Right",
	        	"value" : "topRight",
	        	"type" : "select",
	        	"options" : [{
	        		"text" : "Top Right",
	        		"value" : "topRight"
	        	}, {
	        		"text" : "Top Left",
	        		"value" : "topLeft"
	        	}, {
	        		"text" : "Bottom Right",
	        		"value" : "bottomRight"
	        	}, {
	        		"text" : "Bottom Left",
	        		"value" : "bottomLeft"
	        	}]
	        }, {
	        	"itemId" : "linkpath",
	        	"xtype" : "linkdialog",
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
	        	"style" : "width:100%;",
	        	"xtype" : "static"
	        }]
        };
        config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.HotspotItem.superclass.constructor.call(this, config);
    },

    // overriding CQ.Ext.Component#initComponent
    initComponent: function() {
    	CQ.form.HotspotItem.superclass.initComponent.call(this);
        this.hiddenField = new CQ.Ext.form.Hidden({
            name: this.name,
            "stateful": false
        });
        this.add(this.hiddenField);
        
        this.xvalue = this.items.items[0].items.get("columnone").items.get("xsecond").items.get("xspinner");
        this.yvalue = this.items.items[0].items.get("columntwo").items.get("ysecond").items.get("yspinner");
        this.captionText = this.items.get("caption");
        this.captionAlign = this.items.get("captionalign");
        this.linkTitle = this.items.get("linkpath").dialog.items.items[0].items.items[0].items.items[0].items.get("extendedLinkTitle");
        this.internalLink = this.items.get("linkpath").dialog.items.items[0].items.items[0].items.items[0].items.get("extendedInternalLink");
        this.deepLinkParam = this.items.get("linkpath").dialog.items.items[0].items.items[0].items.items[0].items.get("extendedDeepLinkParam");
        this.inPageLink = this.items.get("linkpath").dialog.items.items[0].items.items[0].items.items[0].items.get("extendedInPageLink");
        this.glossaryLink = this.items.get("linkpath").dialog.items.items[0].items.items[0].items.items[0].items.get("extendedGlossaryLink");
        this.disclaimerLink = this.items.get("linkpath").dialog.items.items[0].items.items[0].items.items[0].items.get("extendedDisclaimerLink");
        this.externalLink = this.items.get("linkpath").dialog.items.items[0].items.items[0].items.items[0].items.get("extendedExternalLink");
        this.linkParams = this.items.get("linkpath").dialog.items.items[0].items.items[0].items.items[0].items.get("extendedLinkParams");
        this.hotspotImg = this.items.get("hotspotimagepanel").items.get("defaultimage");
        this.hotspotHoverImg = this.items.get("hotspotimagepanel").items.get("hoverimage");
    },

    // overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
       var array = value.split("||");
       this.xvalue.setValue(array[0]);
       this.yvalue.setValue(array[1]);
       this.captionText.setValue(array[2]);
       this.captionAlign.setValue(array[3]);
       this.linkTitle.setValue(array[4]);
       this.internalLink.setValue(array[5]);
       this.deepLinkParam.setValue(array[6]);
       this.inPageLink.setValue(array[7]);
       this.glossaryLink.setValue(array[8]);
       this.disclaimerLink.setValue(array[9]);
       this.externalLink.setValue(array[10]);
       this.linkParams.setValue(array[11]);
       this.hotspotImg.setValue(array[12]);
       this.hotspotHoverImg.setValue(array[13]);
    },

    // overriding CQ.form.CompositeField#getValue
    getValue: function() {
       return this.getRawValue();
    },

    // overriding CQ.form.CompositeField#getRawValue
    getRawValue: function() {
       var value = this.xvalue.getValue() + "||" + this.yvalue.getValue() + "||" + (this.captionText.getValue() || "") + "||" + this.captionAlign.getValue() + "||" + this.linkTitle.getValue() + "||" + this.internalLink.getValue() + "||" + this.deepLinkParam.getValue() + "||" + this.inPageLink.getValue() + "||" + this.glossaryLink.getValue() + "||" + this.disclaimerLink.getValue() + "||" + this.externalLink.getValue() + "||" + this.linkParams.getValue() + "||" + this.hotspotImg.getValue() + "||" + this.hotspotHoverImg.getValue();
       this.hiddenField.setValue(value);
       return value;
    }
});

// register xtype
CQ.Ext.reg('hotspotitem', CQ.form.HotspotItem);
//function to disable or enable tabs. Please note: this is copied from core
(function() {
	var chevroletFlexDisableTabs = new ChevroletFlexDisableTabs();
	window.chevroletFlexDisableTabs = function() {
		return chevroletFlexDisableTabs;
	};
})();

function ChevroletFlexDisableTabs() {
	this.disableTab = function(widget, value, disable  /*, exact*/){
		if(disable === 'undefined') {
			disable = true;
		}
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
}



//function to help in toggling tabs for the NavFloat configuration.
(function() {
	var chevyGmdsNavFloatHelper = new ChevyGmdsNavFloatHelper();
	window.chevyGmdsNavFloatHelper = function() {
		return chevyGmdsNavFloatHelper;
	};
})();

function ChevyGmdsNavFloatHelper(){
	
	this.hideOtherTabs = function(widget, value, cls, valuesWhichWillCauseEnable){
		var hide = true;
		var isInArray = mrm.$.inArray(value, valuesWhichWillCauseEnable);
		if(isInArray > -1){
			hide = false;
		}
		
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
	};	
}
