const form=document.querySelector('[data-auth-form]');
const message=document.querySelector('.form-message');
const params=new URLSearchParams(location.search);
const next=params.get('next')?.startsWith('/')?params.get('next'):'/';
const resetToken=params.get('reset')||'';
const google=document.querySelector('.google-auth');
if(google)google.href=`/api/auth/google?next=${encodeURIComponent(next)}`;
if(google)fetch('/api/auth/providers').then(response=>response.json()).then(providers=>{
  if(providers.google)google.classList.add('available');
}).catch(()=>{});
const googleError=params.get('google');
if(googleError&&message)message.textContent={
  unavailable:'Google sign-in is not configured yet.',
  cancelled:'Google sign-in was cancelled.',
  invalid_state:'Google sign-in expired. Please try again.',
  failed:'Google could not complete sign-in. Please try again.',
  unverified:'Please use a verified Google email address.',
  registration_closed:'New registrations are currently closed.',
  disabled:'This portal account is disabled.'
}[googleError]||'Google sign-in could not be completed.';

if(params.get('reset_status')==='complete'&&message)message.textContent='Password reset complete. Sign in with your new password.';
if(resetToken&&form){
  document.querySelector('.auth-card h1').textContent='Reset your password';
  document.querySelector('.auth-card>p').textContent='Choose a new password for your Architecting Intelligence account. This secure link can be used once.';
  google?.remove();
  document.querySelector('.auth-divider')?.remove();
  form.dataset.authForm='password-reset';
  form.innerHTML=`<label>New password<input name="password" type="password" autocomplete="new-password" minlength="10" required><small>At least 10 characters</small></label><label>Confirm new password<input name="password_confirmation" type="password" autocomplete="new-password" minlength="10" required></label><p class="form-message" role="alert"></p><button class="button button-primary" type="submit">Reset password</button>`;
  document.querySelector('.auth-switch').innerHTML='<a href="/login">Return to sign in</a>';
}

form?.addEventListener('submit',async event=>{
  event.preventDefault();
  const activeMessage=form.querySelector('.form-message')||message;
  activeMessage.textContent='';
  const button=form.querySelector('button[type=submit]');
  button.disabled=true;
  const data=Object.fromEntries(new FormData(form));
  try{
    if(form.dataset.authForm==='password-reset'&&data.password!==data.password_confirmation)throw new Error('The passwords do not match.');
    const endpoint=form.dataset.authForm==='register'?'/api/auth/register':form.dataset.authForm==='password-reset'?'/api/auth/password-reset':'/api/auth/login';
    if(form.dataset.authForm==='password-reset')Object.assign(data,{token:resetToken});
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    const contentType=response.headers.get('Content-Type')||'';
    const result=contentType.includes('application/json')
      ?await response.json()
      :{error:'The portal returned an unexpected response. Please try again.'};
    if(!response.ok)throw new Error(result.error||'Unable to continue.');
    if(form.dataset.authForm==='password-reset'){location.href='/login?reset_status=complete';return}
    location.href=result.user?.role==='admin'&&next==='/'?'/admin':next;
  }catch(error){activeMessage.textContent=error.message}
  finally{button.disabled=false}
});
