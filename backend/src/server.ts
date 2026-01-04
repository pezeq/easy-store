import app from "./app";
import { PORT } from "./shared/config/config";

app.listen(PORT, () => {
	console.log(`Server running on PORT ${PORT}`);
});
