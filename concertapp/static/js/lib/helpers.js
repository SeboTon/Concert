/**
 *  @file helpers.js
 *  This file contains helper functions that may be used throughout the client-side code.
 **/

/**
 *  Global variables are in a namespace data structure.  A feature that will soon be 
 *  implemented in the Javascript language natively.
 **/
if(!com) var com = {};
if(!com.concertsoundorganizer) com.concertsoundorganizer = {};
if(!com.concertsoundorganizer.animation) com.concertsoundorganizer.animation = {};

com.concertsoundorganizer.animation = {
    speed: 200,
}

/**
 *  sec_to_timecode
 *  This function will convert between an amount of seconds, and a timecode value.
 *
 *  @param          $seconds            The amount of seconds to convert.
 *  @return         hh:mm:ss            Formatted timecode string.
 **/
function sec_to_timecode($seconds)
{
    var $hours = Math.floor($seconds/3600);
    var $rem = $seconds % 3600;
    var $minutes = Math.floor($rem/60);
    var $seconds = Math.floor($rem%60);
    /* pad zeros */
    if($hours < 10)
    {
        $hours = '0'+$hours;
    }
    if($minutes < 10)
    {
        $minutes = '0'+$minutes;
    }
    if($seconds < 10)
    {
        /* pad to beginning */
        $seconds = '0'+$seconds;
    }
    
    return $hours+':'+$minutes+':'+$seconds;
}

/**
 *  get_event_x
 *  Takes an event, and an element, and returns the X coordinate of that event relative to the element.
 *
 *  @param          $element            The element that the event occurred on.
 *  @param          $e                  The event object.
 *  @return         number              The x-coordinate of the event
 **/
function get_event_x($element, $e){
    /* Get x coordinate of click relative to page */
    var pageX = $e.pageX;
    /* x offset of element from page */
    var elementLeftOffset = $($element).offset().left;
    /* X coordinate of click relative to element */
    var clickX = pageX-elementLeftOffset;
    return clickX;
}

