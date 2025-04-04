我正在使用React和React Router v6构建一个应用。我已经有了一个OAuth2登录流程（假设登录状态可以通过某种方式获取，例如Context API或状态管理库）。现在我有三个路由: `/login`, `/login/callback`, 和 `/dashboard`。请帮我创建一个路由保护机制（例如，一个`ProtectedRoute`组件或使用`Outlet`和`Navigate`），确保只有在用户已认证的情况下才能访问`/dashboard`路由。如果用户未认证访问`/dashboard`，应重定向到`/login`页面。我已经实现部分功能，现在需要完善
1、使用heroui设计美丽的登录界面
2、callback正确处理登录回调并重定向，最好是有等待动画


这是一个用oauth2的登录的项目，使用react-router进行路由，
主要用于buff平台的物品和国外的steam比价，展示各个游戏物品倒卖的利润率，要在数据表中显示利润率和总利润，
总利润=steam的售出价格-15%手续费-buff的2.5%手续费，
现在需要在现有基础上1、设计优美的登录页面2、共有三个路由/login、login/callback 、/dashboard需要对dashboard保护3、完善dashboard页面的功能：搜索物品，表格显示steam和buff上物品的价格数量等信息，并且可以根据数量、价格、总利润、利润率排序，利润率和总利润排序需要考虑实时汇率（需要通过某个api获取）4、使用合适的设计模式实现上面的功能，并按照最佳实践组织项目，保持低耦合实现

这是查询steam社区市场的api
https://steamcommunity.com/market/search/render/?norender=1&query=&start=0&count=10&search_descriptions=0&sort_column=price&sort_dir=asc&appid=730&category_730_ItemSet%5B%5D=any&category_730_ProPlayer%5B%5D=any&category_730_StickerCapsule%5B%5D=any&category_730_Tournament%5B%5D=any&category_730_TournamentTeam%5B%5D=any&category_730_Type%5B%5D=any&category_730_Weapon%5B%5D=any&category_730_Exterior%5B%5D=tag_WearCategory0
