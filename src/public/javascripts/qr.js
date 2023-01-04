const opts = {
	errorCorrectionLevel: 'H',
	type: 'image/webp',
	quality: 1.0,
	margin: 1,
	scale: 10,
	small: true,
	color: {
		dark:"#212e46",
		light:"ffffff"
	}	
};

// Select all the elements with the class name 'qr-canvas'
let qrImgs = document.querySelectorAll('.qr-img');

// Loop through the elements
qrImgs.forEach(function (img) {
	  // Get the text from the data attribute
	  let text = img.getAttribute('data-text');
	  // Generate the QR code
	  QRCode.toDataURL(text, opts, function (error, url) {
		if (error) console.error(error)
		console.log(url)
		img.src = url;
	  })
});