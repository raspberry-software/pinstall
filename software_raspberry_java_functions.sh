#!/bin/bash
#
# File:   raspberry.software.install.java.functions.sh
# Author: Rob@JavaDev
#
# Created on 19-Mar-2018, 14:56:30
#
#This Script unique ID
software_raspberry_java_functions=''
#Dependencies
#If the Unique ID of the script is not defined (the script has not been loaded yet) then source the script. If the script does not exist download it and then source again.
#The +x at the end of the variable is a parameter expansion and the expression returns true if the variable is unset
if [ -z ${software_raspberry_utils+x} ]; then
  [ -f software_raspberry_utils.sh ] || wget -q https://raw.githubusercontent.com/raspberry-software/pinstall/master/software_raspberry_utils.sh && . software_raspberry_utils.sh
fi
#Define variables
DOWNLOADS_DIR=$PWD
DEFAULT_JAVA_HOME_DIR=/usr/java/latest
JAVA_HOME_DIR=''
#
#====== Functions list =======================

# Download java files
function download_java_files() {
  if [ ! -f $DOWNLOADS_DIR/jdk-8u162-linux-arm32-vfp-hflt.tar.gz ]; then
    if $LOG_VERBOSE ; then
      sudo wget -P $DOWNLOADS_DIR --header "Cookie: oraclelicense=accept-securebackup-cookie" http://download.oracle.com/otn-pub/java/jdk/8u162-b12/0da788060d494f5095bf8624735fa2f1/jdk-8u162-linux-arm32-vfp-hflt.tar.gz
    else
     sudo wget -q -P $DOWNLOADS_DIR --header "Cookie: oraclelicense=accept-securebackup-cookie" http://download.oracle.com/otn-pub/java/jdk/8u162-b12/0da788060d494f5095bf8624735fa2f1/jdk-8u162-linux-arm32-vfp-hflt.tar.gz
    fi
  else
    utils::log "File $DOWNLOADS_DIR/jdk-8u162-linux-arm32-vfp-hflt.tar.gz already exists."
  fi
}

# Unpack downloaded java installation files to DOWNLOADS_DIR
function unpack_java_files() {
  if $LOG_VERBOSE ; then
    sudo tar -zxvf $DOWNLOADS_DIR/jdk-8u162-linux-arm32-vfp-hflt.tar.gz -C $DOWNLOADS_DIR
  else
    sudo tar -zxf $DOWNLOADS_DIR/jdk-8u162-linux-arm32-vfp-hflt.tar.gz -C $DOWNLOADS_DIR
  fi
}

# Choose and set JAVA_HOME directory
function set_java_home_dir {
  while true; do
    read -p "Default JAVA_HOME directory is $DEFAULT_JAVA_HOME_DIR. Change it? [Y/n] or [c] for Cancel" yn
    case $yn in
      [Yy]* )
        echo "Oh, I can see you know what you're doing."
        sleep 1
        read -p "Very well. Where to install java?" jdir
        if [ -d "$jdir" ]; then
          JAVA_HOME_DIR=$jdir
        else
          echo "I'm afraid $jdir is NOT a valid directory."
          exit 1
        fi
        break;;
      [Nn]* )
        break;;
      [Cc]* )
        utils::log "Java installation cancelled."
        exit 0
        ;;
      *)
        echo "Choose [Y/n] or [c] for Cancel"
        ;;
    esac
  done
}

# If JAVA_HOME directory already exist choose to either remove it or cancel installation
function remove_java_home_dir_if_exist() {  
  if [ "$(ls -A $JAVA_HOME_DIR)" ]; then
    while true; do
      read -p "JAVA_HOME $JAVA_HOME_DIR directory is NOT empty. Replace old files? [Y/n]" yn
      case $yn in
        [Yy]* )
          sudo rm -R $JAVA_HOME_DIR/*
          break
          ;;
        [Nn]* )
          utils::log "Java installation cancelled."
          exit 1
          ;;
        [Cc]* )
          utils::log "Java installation cancelled."
          exit 1
          ;;
        *)
           echo "Choose [Y/n] or [c] for Cancel";;
      esac
    done
  fi
}

# Create JAVA_HOME directory if not exist 
function create_java_home_dir() {
  sudo mkdir -p $JAVA_HOME_DIR
}

# Move all java files to JAVA_HOME directory
function move_java_files_to_home_dir() {
  utils::log "Moving files to $JAVA_HOME_DIR ..."
  sudo mv $DOWNLOADS_DIR/jdk1.8.0_162/* $JAVA_HOME_DIR/
}

# Configure JAVA_HOME system environment and update alternatives
function config_java() {
  utils::log "Update alternatives"
  sudo chgrp -R root /usr/java/latest
  sudo chown -R root /usr/java/latest
  sudo update-alternatives --install "/usr/bin/java" "java" "/usr/java/latest/bin/java" 1
  sudo update-alternatives --install "/usr/bin/javac" "javac" "/usr/java/latest/bin/javac" 1
  utils::log "Update JAVA_HOME environment variables"
  echo "export JAVA_HOME=$JAVA_HOME_DIR" >> /etc/bash.bashrc
  echo "JAVA_HOME=$JAVA_HOME_DIR" >> /etc/environment
  export JAVA_HOME=$JAVA_HOME_DIR
  if $LOG_VERBOSE ; then
    java -version
  fi
}

#Return $TRUE if Java is installed, $FALSE otherwise
function assert_java_installed() {
  local j_ver=$(java -version 2>&1 | sed -n ';s/.* version "\(.*\)\.\(.*\)\..*"/\1\2/p;')
  if [ '18' == "$j_ver" ] ; then
    utils::log "Java 8 detected."
    return $TRUE
  elif [ '9' = "$j_ver" ] ; then
    utils::log "Java 9 detected."
    return $TRUE
  else
    utils::log "No latest Java JDK version found."
    return $FALSE
  fi
}

# Choose JAVA_HOME directory, make sure JAVA_HOME directory doesn't already exist and create it
function choose_and_create_java_home_dir() {
  set_java_home_dir
  remove_java_home_dir_if_exist
  create_java_home_dir
}

# Start installation
function perform_java_install() {
  utils::log "Installing Java..."
  choose_and_create_java_home_dir
  download_java_files
  unpack_java_files
  move_java_files_to_home_dir
  config_java
  utils::log "Java successfully installed in $JAVA_HOME_DIR"
}

# --------------------------- Public Functions ---------------------------------
# Do nothing when java is already installed, install java otherwise
function java::functions::install() {
  assert_java_installed || [[ perform_java_install && assert_java_installed ]]
}
# ------------------------ End of Public Functions -----------------------------