// 定义初始状态
const initState = {
    userData: {}
};

// 判断action
const reducer = (state = initState, action) => {
    let newState = { ...state };// 获得初始数据
    switch (action.type) {
        case "user_login":
            newState.userData = action.userData;
            return newState; // 获取到了登录的数据
        case "user_modify":
            newState.userData=action.userData;
        default:
            return 1;
    }
}

export default reducer;