#demo-cordova-imager

this is simple application that can run in browser or under cordova on mobile device with functionality:
- load and display image (fits into view area regardless of portrait/landscape mode and image size)
- ability to smoothly pinch-to-zoom image (use shift+mousedown on Desktop to test)
  - drawn lines also zoomed with image
- ability to draw lines
  - click/tap on "Draw" button in footer
  - draw one line with mouse or finger
  - once line finished, it will auto-close it
  - for another line, click on "Draw" again
- ability to delete lines
  - click/tap on "Delete" button in footer
  - click/tap on selected line (_it could be hard to tap on line on real device - as a workaround try to zoom in, so there is a room for improvements_)
  - to delete another line, click on "Delete" again
- on iOS/Android device under cordova app you may open image from photo library
  - click/tap on "Delete" button in footer and select image from library
  - selected image loaded

## things demonstrated

- how to resize image to fit specified container size
- how to pinch-to-zoom with [Hammer.js](http://hammerjs.github.io/)
- how to draw lines with mouse or tap using SVG with [Raphael.js](http://raphaeljs.com/)
- how to easily zoom or scale SVG graphics with Raphael's `Paper.setViewBox()`
- how to open image from the iOS or Android photo gallery with cordova


## how to build Cordova app

```
sudo npm install -g cordova    //this installs cordova, if not yet done

cordova create imager com.yourname.imager Imager //creates directory "imager" with app skeleton in it

cd imager

rm -Rf www //remove default cordova app content

git clone https://github.com/osalabs/demo-cordova-imager.git www/ //put all content of repository www directory into imager/www

cordova plugin add cordova-plugin-camera //adds a camera plugin to app

cordova platform add ios //add platform for ios, repeat for "android" or other platforms if necessary

cordova build //build app, after that you may run it in XCode/emulator

sudo npm install -g ios-sim //optional, install ios-sim, so you can use next command

cordova run ios //if ios-sim installed as above you may run app in simulator directly from command line
```
