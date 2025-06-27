async function resetUser(user)
{
    user.lastRequest = "None";
    user.lastData = null;
    await user.save();
}

module.exports=resetUser;