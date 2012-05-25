var GameDbModeView = Backbone.View.extend(_.extend(CommonView, {

        templateName:'gamedbmodel',

        selectedModel:{
            name:null,
            model:null
        },

        models: [],

        initialize:function (attributes) {
            if (!_.isUndefined(attributes)) {
                this.models = attributes.models;
            }
        },

        getRenderContext:function () {

            var models = [];
            for (modelIndex in this.models) {
                var model = {
                    name:this.models[modelIndex]
                };

                if (this.selectedModel.name == model.name) {
                    model.selected = true;
                }
                models.push(model);
            }

            if (this.selectedModel.name == null) {
                this.selectedModel.name = models[0].name;
            }

            return { models:models, selectedModel:this.selectedModel };
        },

        onShow:function () {
            debug("Showing model");
            this.selectModel(this.selectedModel.name);
        },

        selectModel:function (modelName) {

            this.selectedModel.name = $("#model").val();
            var that = this;
            this.selectedModel.model = new ResourceDefModel({id: this.selectedModel.name});
            this.selectedModel.model.fetch({
                success:function (model, response) {
                    debug("Model fetched: " + model.id);
                    UniGameAdmin.mgmt_view.render();
                    that.renderModel(that, $("#modelFields"));
                },

                error:function (model, response) {
                    debug("error while fetching def");
                    $("#modelFields").empty();
                }
            });

        },

        renderModel:function (model, targetDiv) {
            if (model == null) {
                return;
            }
            var model = this.selectedModel.model;
            var that = this;

            debug("Rendering model");

            Backbone.Marionette.TemplateCache.loadTemplate("dbmodelfield", function (tmpl) {
                that.fieldTemplate = Handlebars.compile(tmpl);

                for (attrKey in model.attributes) {
                    if (attrKey == 'id') {
                        continue;
                    }

                    var fieldDef = {
                        name:attrKey,
                        type:model.attributes[attrKey].type,
                        consts:model.attributes[attrKey].consts,
                        url:model.attributes[attrKey].url,
                        res_id: model.attributes[attrKey].res_id,
                        mandatory:model.attributes[attrKey].mandatory
                    };

                    fieldDef[fieldDef.type] = true;

                    GameDbModeView.prototype.addField(fieldDef, that.fieldTemplate, targetDiv);
                }

                that.fieldTypeChanged();

            });
        },

        addField:function (fieldDef, template, div) {

            var html = template(fieldDef);
            $(html).appendTo(div);
        },

        events:{
            'change #model':'modelSelected',
            'click #addfieldbtn':'addNewField',
            'click #resetBtn':'refetchModel',
            'change .field-type-select': 'fieldTypeChanged',
            'click #saveBtn': 'saveModel'
        },

        modelSelected:function () {
            debug("Model selected: " + $("#model").val());
            this.selectModel($("#model").val());

        },

        addNewField:function () {
            debug("adding new field");
            var fieldDef = {
                name: "new_field",
                isNew: true
            };

            this.addField(fieldDef, this.fieldTemplate, $("#modelFields"));
        },

        refetchModel: function() {
            this.modelSelected();
        },

        fieldTypeChanged: function() {
            debug("field type changed");

            var fields = $(".db-model-field");
            var that = this;

            $(fields).each(function(index, field) {
                var fieldName = $(field).find("[name=fldName]").val();
                var fieldType = $(field).find(".field-type-select").val();
                if (_.isUndefined(fieldType)) { return; }


                var fieldDef = that.selectedModel.model.get(fieldName);
                if (_.isUndefined(fieldDef)) { fieldDef = {}; }
                var args = $(field).find("[args]");

                $(args).show();
                if (fieldType == 'enum') {
                    $(args).find("label").text("Constants");
                    $(args).find("[name=args]").val(fieldDef.consts);
                } else if (fieldType == 'image') {
                    $(args).find("label").text("Base URL");
                    $(args).find("[name=args]").val(fieldDef.url);
                } else if (fieldType == 'ref' || fieldType == 'multiref') {
                    $(args).find("label").text("Base URL");
                    $(args).find("[name=args]").val(fieldDef.url);
                } else if (fieldType == 'sub_resource') {
                    $(args).find("label").text("Sub Resource Def. Name");
                    $(args).find("[name=args]").val(fieldDef.res_id);
                } else {
                    $(args).hide();
                }
            });
        },

        saveModel: function() {
            debug("Saving model");


            var fields = $(".db-model-field");
            var model = this.selectedModel.model;

            $(fields).each(function(index, field) {
                var fieldName = $(field).find("[name=fldName]").val();
                var fieldType = $(field).find(".field-type-select").val();
                var args = $(field).find("[args] > [name=args]").val();

                debug(fieldName + ":" + fieldType + " (" + args + ")");

                var fieldDef = model.get(fieldName);
                if (_.isUndefined(fieldDef)) {

                    fieldDef = {
                        type: fieldType
                    };


                    if (fieldType == 'enum')  {
                        fieldDef.consts = args.split(',');
                    }
                    if (fieldType == 'image') {
                        fieldDef.url = args;
                    }
                    if (fieldType == 'ref' || fieldType == 'multiref') {
                        fieldDef.url = args;
                    }
                    if (fieldType == 'sub_resource') {
                        fieldDef.res_id = args;
                    }

                    model.attributes[fieldName] = fieldDef;
                }

            });

            model.save();
        }
    }
));


