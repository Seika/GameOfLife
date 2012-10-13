/*!
 * (c) 2010-2011 Rotorz Limited. All rights reserved.
 * License: BSD, GNU/GPLv2, GNU/GPLv3
 * Author:  Lea Hayes
 * Website: http://leahayes.co.uk
*/
var $global = window;
 
function $namespace(name, extension) {
    var namespaces = name.split('.');
    var parentNS = $global;
    namespaces.each(function(nsID) {
        var ns = parentNS[nsID];
        if (ns === undefined || ns === null)
            parentNS[nsID] = (ns = {});
        parentNS = ns;
    });
    if (extension) // Extend namespace?
        Object.extend(parentNS, extension);
    return parentNS;
}
