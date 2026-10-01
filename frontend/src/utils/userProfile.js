export function getUserProfile(user) {
    const name = user?.name?.trim() || "User";
    const initial = Array.from(name)[0].toUpperCase();

    return {
        name: initial + Array.from(name).slice(1).join(""),
        initial
    };
}
