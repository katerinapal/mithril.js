import Vnode from "../render/vnode";
"use strict"

export default function(html) {
	if (html == null) html = ""
	return Vnode("<", undefined, undefined, html, undefined, undefined)
};;
