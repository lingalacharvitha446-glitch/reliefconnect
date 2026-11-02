export const loginUser = (user) => {
  localStorage.setItem(
    "currentUser",
    JSON.stringify(user)
  );
};


export const getCurrentUser = () => {
  return JSON.parse(
    localStorage.getItem("currentUser")
  );
};


export const logoutUser = () => {
  localStorage.removeItem("currentUser");
};


export const isLoggedIn = () => {
  return !!localStorage.getItem("currentUser");
};