import './App.css';
import {BrowserRouter, Route, HashRouter, Switch} from "react-router-dom";
import Login from "./components/login";
import Frame from "./components/frame";
import {FindPwd} from "./components/findpwd";
import PrivateRoute from "./routes/privateRoute";
import NotFound from "./components/notfound";

function App() {
    return (
        <div className="App">
            <HashRouter>
                <Switch>
                    <Route exact path={"/"} component={Login}></Route>
                    <Route path={"/login"} component={Login}></Route>
                    <Route path={"/findPwd"} component={FindPwd}></Route>
                    <PrivateRoute path={"/home"} component={Frame}></PrivateRoute>
                    <Route path={"*"} component={NotFound}></Route>
                </Switch>
            </HashRouter>
        </div>
    );
}

export default App;
