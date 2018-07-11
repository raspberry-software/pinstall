#!/bin/bash
#
# File:   software_raspberry_server_payara_web_functions.sh
# Author: Rob@JavaDev
#
# Created on 19-Mar-2018, 14:56:30
#
#This Script unique ID
software_raspberry_server_payara_web_functions=''
#Dependencies
#If the Unique ID of the script is not defined (the script has not been loaded yet) then source the script. If the script does not exist download it and then source again.
#The +x at the end of the variable is a parameter expansion and the expression returns true if the variable is unset
if [ -z ${software_raspberry_utils+x} ]; then
  [ -f software_raspberry_utils.sh ] || wget -q https://raw.githubusercontent.com/raspberry-software/pinstall/master/utils/software_raspberry_utils.sh && . software_raspberry_utils.sh
fi
#
GLASSFISH_HOME=$SERVER_HOME_DIR
#
function server::functions::install {
  sudo adduser $SERVER_USER --gecos '' --disabled-password
  mkdir -p $SERVER_HOME_DIR
  if [ -f $SERVER_HOME_DIR/payara-web-5.182.zip ]; then
    utils::log "Use Payara Web file $SERVER_HOME_DIR/payara-web-5.182.zip"
  else
    sudo wget -P $SERVER_HOME_DIR http://download.oracle.com/glassfish/5.0/release/glassfish-5.0-web.zip
    sudo unzip -q $SERVER_HOME_DIR/payara-web-5.182.zip -d $SERVER_HOME_DIR
    sudo mv $DOWNLOADS_DIR/glassfish5/* $GLASSFISH_HOME/
    log 'Change group of glassfish home directory to glassfish ...'
    sudo chgrp -R glassfish $GLASSFISH_HOME
    log "Change ownership of glassfish home directory to 'glassfish' ..."
    sudo chown -R glassfish:glassfish $GLASSFISH_HOME
    sudo chmod -R ug+rwx $GLASSFISH_HOME/bin/
    sudo chmod -R ug+rwx $GLASSFISH_HOME/glassfish/bin/
    sudo chmod -R o-rwx $GLASSFISH_HOME/bin/
    sudo chmod -R ug+rwx $GLASSFISH_HOME/glassfish/bin/
    sudo -u glassfish $GLASSFISH_HOME/bin/asadmin start-domain domain1
    log "Admin login"
    yes 'admin' | sudo -u glassfish $GLASSFISH_HOME/bin/asadmin login
 #
 #   log 'Set up JVM options ...'
    sudo -u glassfish $GLASSFISH_HOME/bin/asadmin delete-jvm-options '-XX\:MaxPermSize=192m'
    info
    case $pi_ram_total in
         256MB)
              log "256MB of total RAM memory detected"
              ;;
         512MB)
              log "512MB of total RAM memory detected"
              
 #   sudo -u glassfish $GLASSFISH_HOME/bin/asadmin create-jvm-options -- -Xmx768m
              ;;
         1GB)
              log "1GB of total RAM memory detected"
              log "Replace JVM option --client with --server"
              sudo -u glassfish $GLASSFISH_HOME/bin/asadmin delete-jvm-options -- -client
              sudo -u glassfish $GLASSFISH_HOME/bin/asadmin create-jvm-options -- -server
              log "Disable explicit garbage collection"
              sudo -u glassfish $GLASSFISH_HOME/bin/asadmin create-jvm-options '-XX\:+DisableExplicitGC'
              log "Increase max heap size to 768MB"
              sudo -u glassfish $GLASSFISH_HOME/bin/asadmin delete-jvm-options -- -Xmx512m
              sudo -u glassfish $GLASSFISH_HOME/bin/asadmin create-jvm-options -- -Xmx768m
              sudo -u glassfish $GLASSFISH_HOME/bin/asadmin create-jvm-options '-XX\:MaxMetaspaceSize=768m'
              ;; 
         *)
              echo "Hmm, seems I dont have any memory."
              ;;
    esac
 #   sudo -u glassfish $GLASSFISH_HOME/bin/asadmin delete-jvm-options -- -client
 #   echo "-server"
 #   echo "-Xmx768m"
 #   echo "+DisableExplicitGC"
 #   sudo -u glassfish $GLASSFISH_HOME/bin/asadmin create-jvm-options -- -server
 #   sudo -u glassfish $GLASSFISH_HOME/bin/asadmin delete-jvm-options -- -Xmx512m
 #   sudo -u glassfish $GLASSFISH_HOME/bin/asadmin create-jvm-options -- -Xmx768m
 #   sudo -u glassfish $GLASSFISH_HOME/bin/asadmin delete-jvm-options '-XX\:MaxPermSize=192m'
 #   sudo -u glassfish $GLASSFISH_HOME/bin/asadmin create-jvm-options '-XX\:MaxMetaspaceSize=768m'
 #   sudo -u glassfish $GLASSFISH_HOME/bin/asadmin create-jvm-options '-XX\:+DisableExplicitGC'
    log 'Turn off development features for performance ...'
    sudo -u glassfish $GLASSFISH_HOME/bin/asadmin set server.admin-service.das-config.autodeploy-enabled=false
    sudo -u glassfish $GLASSFISH_HOME/bin/asadmin set server.admin-service.das-config.dynamic-reload-enabled=false
    sudo -u glassfish $GLASSFISH_HOME/bin/asadmin stop-domain domain1
    log 'Add GLASSFISH_HOME and PATH environment variables in /etc/bash.bashrc ...'
    sudo echo "export GLASSFISH_HOME=/home/glassfish" >> /etc/bash.bashrc
    sudo echo "export PATH=$PATH:/usr/java/latest/bin:$GLASSFISH_HOME/bin" >> /etc/bash.bashrc
    log 'Add AS_JAVA environment variable in /etc/environment ...'
    sudo echo "AS_JAVA=/usr/java/latest" >> /etc/environment
    #Use GLASSFISH_HOME straight away, without closing the shell
    export GLASSFISH_HOME=$GLASSFISH_HOME
    echo "Glassfish installed successfully in $GLASSFISH_HOME"
    echo "To run Glassfish instance:"
    echo "sudo -u glassfish $GLASSFISH_HOME/bin/asadmin start-domain domain1"
    echo "Glassfish is available at:"
    echo "http://$ip:8080"
  fi
}





