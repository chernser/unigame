var ItemsCollectionView = Backbone.View.extend(_.extend(CommonView, {

        templateName:'itemscollection',

        initialize:function (attributes) {
            if (!_.isUndefined())     {
                this.model = attributes.model;
            }
        },

        onShow: function() {
            debug("Post render items collection");
            var options = {
                url:'admin/items/',
                datatype: 'json',
                mtype: 'GET',
                colNames:['Name','Type'],
                colModel :[
                    {name:'name1', index:'name', jsonmap: 'name', width:55},
                    {name:'type', index:'type', jsonmap: 'type', width:90}
                ],
                jsonReader : {
                    repeatitems: false,
                    id: "id",
                    root: function (obj) { return obj; },
                    page: function (obj) { return 1; },
                    total: function (obj) { return 1; },
                    records: function (obj) { return obj.length; }
                },
                width:800,
                rowNum:10,
                rowList:[10,20,30],
                sortname: 'name',
                sortorder: 'desc',
                viewrecords: false,

                ondblClickRow:function (rowid) {

                },

                onSelectRow:function (rowid) {

                }
            };
            $("#items_collection_tbl").jqGrid(options);


            new ResourceDefModel({id:'item'}).fetch({

                success: function(model, response) {
                    debug("Item definition model was fetched");
                    UniGameAdmin.app.addRegions({ resource_form: "#resource_form"});
                    var itemFieldsOrder = ['image'];
                    var item = {id: 12223};
                    var view = new ResourceFormView({model: model, fieldsOrder: itemFieldsOrder, resource: item});
                    UniGameAdmin.app.resource_form.show(view);
                },

                error: function(model, response)  {
                    debug("failed to get item defenition model");
                }

            });
        },

        getRenderContext:function () {

           return {};
        },

        events: {


        }

    }
));