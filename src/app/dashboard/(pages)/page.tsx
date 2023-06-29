"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Settings from "./settings/page";
import Support from "./support/page";
import AccountIndex from "./components/Index";
import AddOrganization from "./add-organization/page";

function Account() {
  const location = usePathname();

  return (
    <>
      {location === "/dashboard/settings" ? (
        <Settings />
      ) : location === "/dashboard" ? (
        <AccountIndex />
      ) : location === "/dashboard/support" ? (
        <Support />
      ) : location === "/dashboard/add-organization" ? (
        <AddOrganization />
      ) : (
        "Not Found"
      )}
    </>
  );
}

export default Account;
