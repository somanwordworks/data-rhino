import { signIn } from "next-auth/react";

export const handleProtectedNav = async (session, router, target, setShowLoginPopup, setRedirectTarget) => {
  if (!session) {
    setRedirectTarget(target);
    setShowLoginPopup(true);   // 👈 show styled popup from Header
  } else {
    router.push(target);
  }
};
