#!/bin/bash
#
# File:   software_raspberry_project_nowpic.sh
# Author: Rob@JavaDev
#
# Created on 19-Mar-2018, 14:56:30
#
#This Script unique ID
software_raspberry_project_nowpic=''
#Dependencies
#If the Unique ID of the script is not defined (the script has not been loaded yet) then source the script. If the script does not exist download it and then source again.
#The +x at the end of the variable is a parameter expansion and the expression returns true if the variable is unset
if [ -z ${software_raspberry_utils+x} ]; then
   [ -f software_raspberry_utils.sh ] || wget -q https://raw.githubusercontent.com/raspberry-software/pinstall/master/software_raspberry_utils.sh && . raspberry.software.utils.sh
fi
if [ -z ${raspberry_software_install_project_nowpic_functions+x} ]; then
   [ -f raspberry.software.install.project.nowpic.functions.sh ] || wget -q https://www.raspberrypi.software/downloads/raspberry.software.install.project.nowpic.functions.sh && . raspberry.software.install.project.nowpic.functions.sh
fi
#Define variables
#
function main() {
  java::functions::install
  for var in "$@"
  do
    if [ "$var" = "server" ]; then
      project::nowpic::functions::install_server
    elif [ "$var" = "client" ]; then
      project::nowpic::functions::install_client
    fi
  done
}

while getopts "hvl:cs" opt; do
  case ${opt} in
    h )
      echo "Usage:"
      echo "-h"
      echo "-help : Display this help info."
      echo "-d <dir> : set JAVA_HOME directory. Default: /usr/java/latest"
      echo "-v             : Run in verbose mode"
      echo "-l <filename>  : Run in verbose mode and save output to file"
      exit 0
      ;;
    v )
      LOG_VERBOSE=true
      ;;
    l )
      if [[ $OPTARG == /* ]] ; then
        LOG_FILE=$OPTARG
      else
        echo "Logs directory is not valid."
        exit 0
      fi
      ;;
    c )
      is_install_client=true
      ;;
    s )
      is_install_server=true
      ;;
    \? )
      echo "Invalid Option: -$OPTARG" 1>&2
      exit 1
      ;;
  esac
done
shift $((OPTIND -1))

main
