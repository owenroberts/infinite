/*
	used by PackItem and MapItem to add ui mouse events for scene ui updates
	also used by HellMap and Inventory
*/
const itemMixin = {
	over(x, y) {
		this.items.all(item => item.over(x, y));
	},
	out(x, y) {
		this.items.all(item => item.out(x, y));
	},
	down(x, y) {
		this.items.all(item => item.down(x, y));
	},
	up(x, y) {
		this.items.all(item => item.up(x, y));
	}
}