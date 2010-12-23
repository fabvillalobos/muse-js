/**
 * Copyright (c) 2010, yanick.rochon@mind2soft.com
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * - Redistributions of source code must retain the above copyright notice, 
 *   this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, 
 *   this list of conditions and the following disclaimer in the documentation 
 *   and/or other materials provided with the distribution.
 * - Neither the name of the <ORGANIZATION> nor the names of its contributors
 *   may be used to endorse or promote products derived from this software 
 *   without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE 
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 * POSSIBILITY OF SUCH DAMAGE.
 *
 *
 * @package lib/util
 * @version 0.1 
 */


/**
 * Simple date utility to convert a date object as ISO8601 standard.
 * If asUTC is true, the date will use the UTC time instead of the
 * local time. Return a string in the format at "yyyy-mm-ddThh:mm:ssZ"
 *
 * @param Date   date       a date object
 * @param bool   asUTC      if true, use UTC time values
 *
 * @return string
 */
this.getISODateString = function(date, asUTC) {
	function pad(n){
		return n<10 ? '0'+n : n
	}
    
	if (asUTC) {
		return date.getUTCFullYear()+'-'
			+ pad(date.getUTCMonth()+1)+'-'
			+ pad(date.getUTCDate())+'T'
			+ pad(date.getUTCHours())+':'
			+ pad(date.getUTCMinutes())+':'
			+ pad(date.getUTCSeconds())+'Z';
	} else {
		return date.getFullYear()+'-'
			+ pad(date.getMonth()+1)+'-'
			+ pad(date.getDate())+'T'
			+ pad(date.getHours())+':'
			+ pad(date.getMinutes())+':'
			+ pad(date.getSeconds())+'Z';
	}
};
