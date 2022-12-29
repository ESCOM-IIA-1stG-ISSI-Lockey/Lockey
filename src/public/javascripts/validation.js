(() => {
	// Fetch all the forms we want to apply custom Bootstrap validation styles to
	const forms = document.querySelectorAll('form')	

	// Loop over them and prevent submission
	Array.from(forms).forEach(form => {
		Array.from(form.elements).forEach((element) => {

			element.addEventListener('change', event =>  {
				element.classList.remove('is-invalid')
			});
		});

		form.addEventListener('submit', event => {
			event.preventDefault();
			event.stopPropagation();

			let action = form.getAttribute('action'),
					method = form.getAttribute('method'),
					urlencoded = new URLSearchParams();
					
				// element.type in ['text', 'email', 'password', 'number', 'tel', 'date', 'time', 'textarea']

				Array.from(form.elements)
					.filter(element => element.name !== '')
					.filter(element => {
						if (element.type == 'radio')
							return element.checked;
						return true;
					})
					.forEach(element => {
						console.log(element.name, element.type=='checkbox'?element.checked:element.value);
						urlencoded.append(element.name, element.type=='checkbox'?element.checked:element.value);
					});

				form.querySelectorAll('fieldset')
					.forEach((fieldset) => fieldset.disabled = true);
				fetch(action, {
					method: method,
					body: urlencoded,
				})
				.then(res => res.json())
				.then(data => {
					if (data.response == 'OK')
						if (data.redirect)	// redirect to url
							window.location.href = data.redirect;
						else if(data.modal)	// switch modal
							switchModal(data.modal.old, data.modal.new);
						
						else {				// show toast
							console.log(data.message);
							toast(data.message, TOAST_TYPES.SUCCESS);
						}
					else if (data.response == 'ERROR') {
						if (data.errors) {	// show errors
							let errors = data.errors.filter((err, index, self) => 
								index === self.findIndex((t) => (t.param === err.param))
							);
							
							for (let err of errors) {
								let input = form.querySelector(`[name="${err.param}"]`);
								let feedback = form.querySelector(`[name="${err.param}"] + label + .invalid-feedback,label + [name="${err.param}"] + .invalid-feedback`);
								input.classList.add('is-invalid');
;							if (feedback)
									feedback.textContent = err.msg;
							}
						}
						else				// show toast
							throw new Error(data.message);
					}
					else 
						throw new Error('Error al recibir la respuesta del servidor');
					
					
				})
				.catch(err => {
					toast(err.message? err.message : 'Error al enviar la petición', TOAST_TYPES.ERROR);
					console.log(err);
				})
				.finally(() => {
					form.querySelectorAll('fieldset')
					.forEach((fieldset) => fieldset.disabled = false);
				});
		}, false)
	})
})()