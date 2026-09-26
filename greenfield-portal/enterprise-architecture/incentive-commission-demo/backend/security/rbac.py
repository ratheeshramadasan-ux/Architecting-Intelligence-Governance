ROLE_PERMISSIONS={"operations_analyst":{"submit"},"commission_approver":{"approve_commission"},"process_owner":{"resolve_exception"},"privacy_reviewer":{"approve_privacy"},"policy_owner":{"activate_sop"}}
def authorize(role:str,permission:str)->None:
    if permission not in ROLE_PERMISSIONS.get(role,set()): raise PermissionError(f"Role {role} cannot {permission}")
def enforce_sod(submitted_by:str,approved_by:str)->None:
    if submitted_by==approved_by: raise PermissionError("Segregation of duties: submitter cannot approve")
