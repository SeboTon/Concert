var $animation_speed = 200;

/**
*  Constructor for a waveform player object.
*
*  @param      $type       Type of waveform player (editor, viewer)
*  @param      $id         id of container element
*  @param      $audio_id   id of associated audio element
**/
function WaveformPlayer($type, $id, $audio_id)
{
    /* Error check type */
    if($type != 'viewer' && $type != 'editor')
    {
        throw 'Invalid type.';
    }
    else
    {
        this.type = $type;    
    }

    /* audio element */
    this.audio_id = $audio_id;
    this.audio_element = $('#'+$audio_id).get(0);
    if(!this.audio_element)
    {
        throw 'Invalid audio_id.';
    }

    /* id */
    this.id = $id;
    /* The waveform container (div) */
    this.container = $('#'+$id).get(0);
    
    if(this.type == 'editor')
    {
        /* The object to animate is actual waveform image */
        this.animate_object = $('#'+$id+' > img.waveform_image').get(0);
        
        /* The highlight element on the page */
        this.highlight_object = $('#'+$id+' > div#highlight').get(0);
        /* A variable to set when highlight is occuring */
        this.dragging = 0;
        /* Variables for beginning and end of highlight */
        this.highlightStart = -1;
        this.hightlightEnd = -1;
        
        /* waveform image width */
        this.width = $(this.animate_object).attr('src').split('_')[1].match(/[\d]+/)*1;
        if(!this.width)
        {
            throw 'Could not get waveform image width.';
        }
        
        /**
         * Behavior for highlighting a section of the waveform
         **/
        $(this.container).mousedown(function(waveformPlayerObject){return function(event){
            /* Prevent default click behavior */
            event.preventDefault();
            
            /* Clear old highlight */
            waveformPlayerObject.highlightStart = -1;
            waveformPlayerObject.highlightEnd = -1;
            waveformPlayerObject.highlight();
                        
            /* X coordinate of click relative to element */
            waveformPlayerObject.highlightStart = clickXElement(this, event);
                        
            /* Set variable to denote dragging is in progress */
            waveformPlayerObject.dragging = 1;
            
            waveformPlayerObject.highlight();
            
            
        }}(this));
        
        $(this.container).mousemove(function(waveformPlayerObject){return function(event){
            /* if mouse is down */
            if(waveformPlayerObject.dragging){
                
                /* Get x location of mouse relative to element */
                waveformPlayerObject.highlightEnd = clickXElement(this, event);
                
                waveformPlayerObject.highlight();
                
            }
        }}(this));
        
        $(this.container).mouseup(function(waveformPlayerObject){return function(event){
            /* Prevent default mouseup behavior */
            event.preventDefault();            
            
            /* Get actual waveform left value to determine offset from beginning of song */
            var left = $('#'+waveformPlayerObject.id+' > img#waveform_editor_image').css('left').match(/[\d]+/);
            var timeOffsetPx = 400-left;
            /* Mark object as not being dragged anymore */
            waveformPlayerObject.dragging = 0;
            
            if(waveformPlayerObject.highlightStart < waveformPlayerObject.highlightEnd)
            {
                var highlightData = {
                    start: waveformPlayerObject.highlightStart,
                    end: waveformPlayerObject.highlightEnd
                };
            }
            else
            {
                var highlightData = {
                    start: waveformPlayerObject.highlightEnd,
                    end: waveformPlayerObject.highlightStart
                };
            }

            //$('#'+this.id).trigger('highlight', highlightData);
        }}(this));
    }
    else if(this.type == 'viewer')
    {
        /* container width */
        this.width = 800;
        /* object to animate is playhead */
        this.animate_object = $('#'+$id+' > div.playhead').get(0);
        /* timecode object */
        this.timecode_container = $('#'+$id+' > div.timecode').get(0);
        
        /* behavior for clicking in viewer and changing time code */
        $(this.container).click(function(waveformPlayerObject){ return function(event){
            /* prevent default click behavior */
            event.preventDefault();
            /* make some vars local for quicker access */
            var $ = jQuery;
            var audio_element = waveformPlayerObject.audio_element;
            
            /* X coordinate of click relative to element */
            var clickX = clickXElement(this, event);
            /* percent of width */
            var clickPerc = clickX/$(this).css('width').match(/[\d]+/);
            /* new time in audio file */
            var newTime = (clickPerc*audio_element.duration);
            /* move current time of audio file to clicked location */
            audio_element.currentTime = newTime;
            
            /* if player was paused, manually move playhead and change time. If not, this will happen automatically in <=100ms because song is playing. */
            if(!$(audio_element).hasClass('playing'))
            {
                $(waveformPlayerObject.container).children('div.playhead').css('margin-left', (clickX)+'px');                
                $(waveformPlayerObject.container).children('div.timecode').html(sec_to_timecode(newTime))
            }
            
        }}(this));
    }

}

function clickXElement($element, $e){
    /* Get x coordinate of click relative to page */
    var pageX = $e.pageX;
    /* x offset of element from page */
    var elementLeftOffset = $($element).offset().left;
    /* X coordinate of click relative to element */
    var clickX = pageX-elementLeftOffset;
    return clickX;
}

/**
*  toString function for a waveform player object
*  helpful for debugging.
**/
WaveformPlayer.prototype.toString = function()
{
    return this.id+': '+this.type+', '+this.audio_id+', '+this.width;
}

WaveformPlayer.prototype.play = function()
{
    /* Set container class to 'playing' */
    $(this.container).addClass('playing');
    /* play animation */
    setTimeout(function(audio_element, width, container, animate_object, type, timecode_container){ return function(){ play_animation(audio_element, width, container, animate_object, type, timecode_container); }}(this.audio_element, this.width, this.container, this.animate_object, this.type, this.timecode_container), $animation_speed);        

}

WaveformPlayer.prototype.animateOnce = function()
{
    play_animation(this.audio_element, this.width, this.container, this.animate_object, this.type, this.timecode_container);
}

/**
 *  highlight member function uses the highlightStart and highlightEnd member variables to draw the 
 *  appropriate highlight in the interface.
 **/
WaveformPlayer.prototype.highlight = function()
{
    if(this.type != 'editor'){
        return null;
    }
    
    if(this.highlightStart == -1 || this.highlightEnd == -1)
    {
        /* Clear highlight */
        $('#'+this.id+' > div#highlight').css('margin-left', '0px').css('width', '0px');
    }
    else
    {
        /* Highlight waveform */
        var audioDuration = this.audio_element.duration;
        var elementWidth = $(this.container).css('width').match(/[\d]+/);
        
        /* Highlight section of waveform denoted by the highlightEnd and highlightStart member variables */
        var highlightStartPerc = this.highlightStart/audioDuration;
        var highlightEndPerc = this.highlightEnd/audioDuration;

        var highlightStartPix = highlightStartPerc*elementWidth;
        var highlightEndPix = highlightEndPerc*elementWidth;
        
        /* Forward highlight */
        if(this.highlightStart < this.highlightEnd)
        {
            /* Set highlight */
            $('#'+this.id+' > div#highlight').css('margin-left', this.highlightStart+'px').css('width', (this.highlightEnd-this.highlightStart)+'px');
        }
        else
        {
            /* set backwards highlight */
            $('#'+this.id+' > div#highlight').css('margin-left', this.highlightEnd+'px').css('width', (this.highlightStart-this.highlightEnd)+'px');            
        }
    }
    
}

/**
 *  play_animation
 *  If the type is a editor, moves waveform to the left based on the elapsed time of playing
 *  audio file.  If viewer, moves the playhead to the right.  meant to be called every $animation_speed ms.
 *
 *  @param          $audio                  The audio element associated with this waveform
 *  @param          $width                  The length in pixels of the waveform width/waveform container width
 *  @param          $waveform_container     The div of the waveform container
 *  @param          $animate_object         The object to animate
 *  @param          $type                   The type of waveform container (viewer, editor)
 *  @param          $timecode_container     The container holding the timecode
 **/
function play_animation($audio, $width, $waveform_container, $animate_object, $type, $timecode_container)
{
    /* Make jQuery object a local variable for quicker access */
    var $ =  jQuery;
    
    /* Percentage of song we are currently on */
    var $actualPercent = $audio.currentTime/$audio.duration;
    /* new position */
    var $newPos = $actualPercent*$width;
    
    if($timecode_container)
    {
        var $timecode = sec_to_timecode($audio.currentTime);
        $($timecode_container).html($timecode);        
    }
    
    if($type == 'editor')
    {
        /* new left value (because waveform actually moves backwards and starts at 400) */
        var $newLeft = ($newPos-400)*-1;
        /* Set new waveform position */
        $($animate_object).css('left', $newLeft+'px');
    }
    else if($type == 'viewer')
    {
        $($animate_object).css('margin-left', $newPos+'px');
    }

    /* make sure audio element is still playing */
    if($($audio).hasClass('playing'))
    {
        /* if so, go again in $animation_speed ms */
        setTimeout(function(audio_element, width, container, object, type, timecode_container){ return function(){ play_animation(audio_element, width, container, object, type, timecode_container); }}($audio, $width, $waveform_container, $animate_object, $type, $timecode_container), $animation_speed);
    }
    else
    {
        /* Remove container 'playing' class */
        $($waveform_container).removeClass('playing');
    }
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
