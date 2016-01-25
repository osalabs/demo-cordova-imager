var app = {
    imager: null,

    initialize : function() {
        console.log('initialize');

        $(window).on('imager.info', function  (e, data) {
            console.log(data);
            $('#info').text(data);
        });

        //initial image
        var use_image = 'img/sunflower_landscape.jpg';
        //var use_image = 'img/sunflower_portrait.jpg';
        app.load_image(use_image);

        $('.on-draw').on('click', app.on_draw);
        $('.on-del').on('click', app.on_del);
        $('.on-gallery').on('click', app.on_gallery);
    },

    load_image: function (url) {
        app.imager = new Imager(url);
        window.imager = app.imager; //for debug
    },

    on_draw: function (e) {
        app.imager.draw_mode();
    },

    on_del: function (e) {
        app.imager.delete_mode();
    },

    on_gallery: function (e) {
        if (!navigator.camera) alert('Only work from within cordova app');
        navigator.camera.getPicture(app.on_gallery_open, app.on_gallery_error,{
            quality: 100,
            destinationType: navigator.camera.DestinationType.FILE_URI,
            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
        });
    },

    on_gallery_open: function (imageURI) {
        app.load_image(imageURI);
    },

    on_gallery_error: function (msg) {
        alert('Image open failed because: ' + msg);
    }
};