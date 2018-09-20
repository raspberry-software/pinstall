#!/bin/bash
#
# File:   software_raspberry_project_wifirc_functions.sh
# Author: Rob@JavaDev
#
# Created on 25-Apr-2018, 11:50:31
#
#This Script unique ID
software_raspberry_project_wifirc_functions=''
#Dependencies
#If the Unique ID of the script is not defined (the script has not been loaded yet) then source the script. If the script does not exist download it and then source again.
#The +x at the end of the variable is a parameter expansion and the expression returns true if the variable is unset
if [ -z ${software_raspberry_utils+x} ]; then
   [ -f software_raspberry_utils.sh ] || wget -q https://raw.githubusercontent.com/raspberry-software/pinstall/master/utils/software_raspberry_utils.sh && . software_raspberry_utils.sh
fi
#Choose the project directory
PROJECT_HOME=$PWD
PI_VER=''
sudo mkdir -p $PROJECT_HOME
#
function download_jsmpeg {
   wget -q -P $PROJECT_HOME/resources/js https://github.com/phoboslab/jsmpeg/blob/master/jsmpeg.min.js
}
function install_ffmpeg {
   sudo apt-get install ffmpeg
   #Install node.js and npm
   curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
   sudo apt-get install nodejs
   #Install http-server
   sudo npm -g install http-server
   #Install "ws" package on $PROJECT_HOME, under "node_modules"
   npm install ws --save
}
#Create 'startup.sh' script that runs services on startup in the background and save its pid
function create_startup_script {
   mkdir -p $PROJECT_HOME/control
   echo '#!/bin/bash' > $PROJECT_HOME/control/startup.sh
   echo "PROJECT_HOME=$PROJECT_HOME" >> $PROJECT_HOME/control/startup.sh
   echo "#The onboard Raspberry Camera can be made available as V4L2 device by loading a kernel module" >> $PROJECT_HOME/control/startup.sh
   echo "sudo modprobe bcm2835-v4l2" >> $PROJECT_HOME/control/startup.sh
   echo "cd $PROJECT_HOME" >> $PROJECT_HOME/control/startup.sh
   echo "#Start the Websocket relay. Provide a password and a port for the incomming HTTP video stream and a Websocket port that we can connect to in the browser." >> $PROJECT_HOME/control/startup.sh
   echo "#Save (or override if exist) process id" >> $PROJECT_HOME/control/startup.sh
   echo 'function runWS {' >> $PROJECT_HOME/control/startup.sh
   echo '   nohup node app.js supersecret 8081 8082 >/dev/null 2>&1 &' >> $PROJECT_HOME/control/startup.sh
   echo '   local ws_app_pid=$!' >> $PROJECT_HOME/control/startup.sh
   echo '   echo "$ws_app_pid" > $PROJECT_HOME/control/ws-app-pid' >> $PROJECT_HOME/control/startup.sh
   echo '}' >> $PROJECT_HOME/control/startup.sh
   echo "#Run http server in the background and save (override) process id" >> $PROJECT_HOME/control/startup.sh
   echo 'function runHTTPServer {' >> $PROJECT_HOME/control/startup.sh
   echo '   nohup http-server >/dev/null 2>&1 &' >> $PROJECT_HOME/control/startup.sh
   echo '   local http_server_pid=$!' >> $PROJECT_HOME/control/startup.sh
   echo '   echo "$http_server_pid" > $PROJECT_HOME/control/http-server-pid' >> $PROJECT_HOME/control/startup.sh
   echo '}' >> $PROJECT_HOME/control/startup.sh
   echo "runWS" >> $PROJECT_HOME/control/startup.sh
   echo "runHTTPServer" >> $PROJECT_HOME/control/startup.sh
   sudo chmod +x $PROJECT_HOME/control/startup.sh
   sudo chown -Rf pi:pi $PROJECT_HOME/control
   #Append script path to /etc/rc.local
   sed -i '/exit 0/d' /etc/rc.local
   echo "$PROJECT_HOME/control/startup.sh" >> /etc/rc.local
   echo "exit 0" >> /etc/rc.local
}
function create_dashcam_streaming_scripts {
  create_start_stream_script
  create_stop_stream_script
}
#Create script that runs ffmpeg stream from webcam to websocket
function create_start_stream_script {
   mkdir -p $PROJECT_HOME/control
   echo '#!/bin/bash' > $PROJECT_HOME/control/start-dashcam-stream.sh
   echo "cd $PROJECT_HOME" >> $PROJECT_HOME/control/start-dashcam-stream.sh
   echo '#Stream video in the background process' >> $PROJECT_HOME/control/start-dashcam-stream.sh
   echo 'function startDashcamStream {' >> $PROJECT_HOME/control/start-dashcam-stream.sh
   echo '   nohup ffmpeg -f v4l2 -framerate 25 -video_size 640x480 -i /dev/video0 -f mpegts -vcodec mpeg1video -s 640x480 -b:v 900k -bf 0 http://localhost:8081/supersecret >/dev/null 2>&1 &' >> $PROJECT_HOME/control/start-dashcam-stream.sh
   echo '   local dashcam_stream_pid=$!' >> $PROJECT_HOME/control/start-dashcam-stream.sh
   echo '   echo "$dashcam_stream_pid" > $PWD/dashcam-stream-pid' >> $PROJECT_HOME/control/start-dashcam-stream.sh
   echo '}' >> $PROJECT_HOME/control/start-dashcam-stream.sh
   echo "startDashcamStream" >> $PROJECT_HOME/control/start-dashcam-stream.sh
   sudo chmod +x $PROJECT_HOME/control/start-dashcam-stream.sh
}
#
function create_stop_stream_script {
   mkdir -p $PROJECT_HOME/control
   echo '#!/bin/bash' > $PROJECT_HOME/control/stop-dashcam-stream.sh
   echo '#Stop streamming video' >> $PROJECT_HOME/control/stop-dashcam-stream.sh
   echo 'function stopDashcamStream {' >> $PROJECT_HOME/control/stop-dashcam-stream.sh
   echo '   pid=$(cat /home/pi/pirc/control/dashcam-stream-pid)' >> $PROJECT_HOME/control/stop-dashcam-stream.sh
   echo '   sudo kill -9 $pid' >> $PROJECT_HOME/control/stop-dashcam-stream.sh
   echo '}' >> $PROJECT_HOME/control/stop-dashcam-stream.sh
   echo "stopDashcamStream" >> $PROJECT_HOME/control/stop-dashcam-stream.sh
   sudo chmod +x $PROJECT_HOME/control/stop-dashcam-stream.sh
   sudo chown -Rf pi:pi $PROJECT_HOME/control
}

function project::wifirc::functions::install_server {
  download_jsmpeg
  install_ffmpeg
  create_startup_script
  create_dashcam_streaming_scripts
}
function project::wifirc::functions::install_client {
   #Install http files
  sudo npm -g install http-server
  
}