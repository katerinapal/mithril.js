import vnode from "./render/vnode";
export { vnode };
import buildQueryString from "./querystring/build";
export { buildQueryString };
import parseQueryString from "./querystring/parse";
export { parseQueryString };
import withAttr from "./util/withAttr";
export { withAttr };
import route from "./route";
export { route };
import mount from "./mount";
export { mount };
import redrawService from "./redraw";
import requestService from "./request";
import m from "./hyperscript";
"use strict"

export default m;

requestService.setCompletionCallback(redrawService.redraw)

mount
route
withAttr
m.render = require("./render").render
m.redraw = redrawService.redraw
m.request = requestService.request
m.jsonp = requestService.jsonp
parseQueryString
buildQueryString
m.version = "bleeding-edge"
vnode
