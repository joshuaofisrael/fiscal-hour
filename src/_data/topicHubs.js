// Alias for the topic hub definitions so templates can loop hubs even when a
// page's own `topics` front matter or computed data shadows the global `topics`
// array (that shadowing was rendering /topics/undefined/ in the header).
import topics from "./topics.js";
export default topics;
