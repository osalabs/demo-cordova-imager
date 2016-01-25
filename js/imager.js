/*
Imager class
- load an image into workarea (by default- document.body)
- initially fit image into workarea dimensions
- allow to draw lines over image
- allow to delete drawn lines
- support pinch-to-zoom ability image+drawn lines
 */
function Imager(url) {
    self = this;
    self.image_url = url;
    self.image = new Image();
    self.image.is_loaded=false;

    //for drawing
    self.main_paper=null;
    self.main_drawing_box=null;
    self.main_arrpath=null;
    self.main_bg=null;
    self.draw_ox=0;
    self.draw_oy=0;
    self.viewbox_x=0;
    self.viewbox_y=0;
    self.viewbox_w=0;
    self.viewbox_h=0;

    //for image workarea
    self.workarea = document.body;
    self.$workarea = $(self.workarea); //cache jquery object
    self.top_margin = $('body > .header').height();
    self.bottom_margin = $('body > .footer').height(); //height of header and footer
    self.w = 0; //current workarea width
    self.h = 0; //current workarea height
    self.scale=1; //current scale
    self.base_scale=1; //base scale when pinch started

    $('svg').remove();//cleanup any existing svg areas, could be present if imager re-created second time

    self.set_background_size = function() {
        //calculate background size
        var bs_w, bs_h;
        var ratio = self.image.width/self.image.height;
        var w_scale = self.image.width/self.w;
        var h_scale = self.image.height/self.h;

        if (w_scale>h_scale){
            bs_w=self.w;
            bs_h=Math.floor(bs_w/ratio);
        }else{
            bs_h=self.h;
            bs_w=Math.floor(bs_h*ratio);
        }

        bs_w=bs_w*self.scale;
        bs_h=bs_h*self.scale;

        self.workarea.style.backgroundSize=bs_w+'px '+bs_h+'px';

        //also resize drawn area
        if (self.main_paper){
            var old_w = self.viewbox_w;
            var old_h = self.viewbox_h;
            self.viewbox_w = self.w / self.scale;
            self.viewbox_h = self.h / self.scale;

            self.viewbox_x -= (self.viewbox_w - old_w)/2;
            self.viewbox_y -= (self.viewbox_h - old_h)/2;
            self.main_paper.setViewBox(self.viewbox_x, self.viewbox_y - self.top_margin, self.viewbox_w, self.viewbox_h);
        }
    };

    //recount current workarea width/height
    self.on_workarea_resize = function (e){
        console.log('on workarea resize');
        self.w = window.innerWidth;
        self.h = window.innerHeight-self.top_margin-self.bottom_margin;
        self.$workarea.height(self.h);
        console.log('workarea size:', self.w, self.h);
        if (self.image.is_loaded){
            self.set_background_size();
        }
    };

    window.onresize=self.on_workarea_resize;
    self.on_workarea_resize();

    //load image
    $(window).trigger('imager.info', 'image loading...');
    self.image.onload = function (e) {
        self.image.is_loaded=true;
        self.workarea.style.backgroundImage='url('+self.image.src+')';
        self.set_background_size();
        $(window).trigger('imager.info', '');
    };
    self.image.src=self.image_url;

    //pinch to zoom
    var hmm = Hammer(self.workarea);
    hmm.get('pinch').set({ enable: true });

    hmm.on('pinchmove', function(e) {
        //console.log('pinch move, init=', e.scale, e);
        self.scale = self.base_scale * e.scale;
        self.set_background_size();
    });
    hmm.on('pinchstart', function(e) {
        //console.log('pinch start, init=', e.scale, e);
        //set base scale
        self.base_scale=self.scale;
    });

    //for drawing
    self.draw_mousemove = function (e) {
        var x = e.pageX;
        var y = e.pageY;

        // subtract paper coords on page
        self.draw_ox = x - 0;
        self.draw_oy = y - self.top_margin;
    };
    self.draw_drag_start = function (e) {
        self.main_arrpath = [];
    };
    self.draw_drag_move = function (dx, dy) {
        if (self.main_arrpath.length === 0) {
            self.main_arrpath[0] = ["M",self.draw_ox,self.draw_oy];
            self.main_drawing_box = self.main_paper.path(self.main_arrpath);
            self.main_drawing_box.attr({stroke: "#FF0000","stroke-width": 3});
        }else{
            //add new point - TODO - possible to optimize - reduce number of points if too close, so device will spend less rsources to draw line
            self.main_arrpath[self.main_arrpath.length] =["L",self.draw_ox,self.draw_oy];
        }

        self.main_drawing_box.attr({path: self.main_arrpath});
    };
    self.draw_drag_up = function (e) {
        //close line first
        if (self.main_arrpath.length>0){
            self.main_arrpath[self.main_arrpath.length] =["L",self.main_arrpath[0][1],self.main_arrpath[0][2]];
            self.main_drawing_box.attr({path: self.main_arrpath});
        }

        self.draw_mode_end();
    };

    //init draw mode. Once one line drawn - mode reset to normal
    self.draw_mode = function(e){
        if (!self.main_paper) {
            self.viewbox_x=0;
            self.viewbox_y=self.top_margin;
            self.viewbox_w=self.w;
            self.viewbox_h=self.h;
            self.main_paper = Raphael(0,self.top_margin,self.w,self.h); //init only once, TODO handle on window resize
            self.main_bg = self.main_paper.rect(0,0,self.w,self.h);
            self.main_bg.attr("stroke", "rgba(100%, 100%, 100%, 0%)");//set transparent border
            self.main_bg.attr("fill", "rgba(100%, 100%, 100%, 0%)");//set transparent bg
        }
        self.delete_mode_end();
        //when start draw - reset scale
        self.scale=1;
        self.on_workarea_resize();

        self.main_bg.mousemove(self.draw_mousemove);
        self.main_bg.drag(self.draw_drag_move, self.draw_drag_start, self.draw_drag_up);
        console.log('in draw mode');
        return self.main_paper;
    };
    self.draw_mode_end = function (e) {
        //remove draw handlers
        self.main_bg.undrag();
        self.main_bg.unmousemove(self.draw_mousemove);
    };

    //delete mode
    self.del_click = function (e) {
        console.log('deleting ', e, this, $(this), $(this.node));
        this.remove();
        self.delete_mode_end();
        return false;
    };

    //init delete mode. Once one line deleted - mode reset to normal
    self.delete_mode = function(e){
        self.draw_mode_end();
        if (!self.main_bg) return;
        self.main_paper.forEach(function (el) {
            if (el.type=='path') el.click(self.del_click);
        });

        console.log('in delete mode');
    };
    self.delete_mode_end = function(e){
        //remove del handlers
        if (!self.main_bg) return;
        self.main_paper.forEach(function (el) {
            el.unclick(self.del_click);
        });
    };
}