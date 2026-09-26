const contactForm=document.querySelector('#contact-form');
const emailField=document.querySelector('#senderEmail');
const emailError=document.querySelector('#emailError');
const contactSuccess=document.querySelector('#formSuccess');
emailField?.addEventListener('input',()=>{emailError.hidden=true;emailField.removeAttribute('aria-invalid')});
contactForm?.addEventListener('submit',event=>{
  event.preventDefault();
  if(!emailField.checkValidity()){emailError.hidden=false;emailField.setAttribute('aria-invalid','true');emailField.focus();return}
  const subject=document.querySelector('#contactSubject').value||'Website enquiry';
  const message=document.querySelector('#contactMessage').value.trim();
  contactSuccess.hidden=false;
  location.href=`mailto:ratheesh.ramadasan@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${emailField.value.trim()}\n\n${message}`)}`;
});
