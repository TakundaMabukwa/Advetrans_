"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { ChangePassword } from "@/lib/action/auth";

function UpdatePswrd() {
    const [newpassword, setNewpassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    return (
        <>
            <form className="mt-10 w-full" action="#">
                <div className="mt-10 grid grid-rows-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium leading-6 text-gray-900"
                        >
                            New password
                        </label>
                        <div className="mt-2">

                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                placeholder="••••••••"
                                // className="focus:ring-primary-600 focus:border-primary-600 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                                required
                                autoComplete="new-password"
                                className="block w-full rounded-md border-0 px-5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                    <div className="sm:col-span-3">
                        <label
                            htmlFor="confirm-password"
                            className="block text-sm font-medium leading-6 text-gray-900"
                        >
                            Confirm password
                        </label>
                        <div className="mt-2">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirm-password"
                                id="confirm-password"
                                // value={confirmPassword}
                                // onChange={(e) =>
                                //   setConfirmPassword(e.target.value)
                                // }
                                autoComplete="new-password"
                                className="block w-full rounded-md border-0 px-5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex">
                    <Button type="submit" formAction={ChangePassword}>
                        Update Password
                    </Button>
                </div>
            </form>
        </>
    );
}

export default UpdatePswrd;