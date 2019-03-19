import Vnode from "../render/vnode";
"use strict"

export default function(attrs, children) {
	return Vnode("[", attrs.key, attrs, Vnode.normalizeChildren(children), undefined, undefined)
};;
