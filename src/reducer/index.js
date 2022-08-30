// 定义初始状态
const initState = {
    userData: {}, // 存放用户自己的数据
    key: 1, // 记录点击的侧边栏
    caseRoute: [], // 记录案例管理的面包屑
};

// 判断action
const reducer = (state = initState, action) => {
    let newState = { ...state }; // 获得初始数据
    if (action.type === "user_login") { // 用户登录时的数据
        newState.userData = action.userData;
        return newState; // 获取到了登录的数据
    }
    if (action.type === "switch_page") { // 用户切换侧边栏
        newState.key = action.key;
        return newState;
    }
    return state;
}

export default reducer;