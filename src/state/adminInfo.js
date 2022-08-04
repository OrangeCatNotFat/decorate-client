import React, {useContext} from "react";
// import Login from "../components/login";
import Home from "../components/home";

const AdminInfo = (props) => {
    console.log(props);
    const {name, role} = props;

    const AppContext = React.createContext();

    const A = () => {
        const {name, role} = useContext(AppContext);
        return (
            <Home name={name} role={role}></Home>
        )
    }

    return (
        <AppContext.Provider value={{name: name, role: role}}>
            <A/>
        </AppContext.Provider>
    )
}

export default AdminInfo;