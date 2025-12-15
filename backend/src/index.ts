import app from "./app";
import { PORT } from "./util/config";

app.listen(PORT, () => {
	console.log(`Server running on PORT ${PORT}`);
});
