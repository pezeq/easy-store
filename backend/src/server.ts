import { PORT } from "@shared/config/config.js";
import app from "./app.js";

app.listen(PORT, () => {
	console.log(`Server running on PORT ${PORT}`);
});
