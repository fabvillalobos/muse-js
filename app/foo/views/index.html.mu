<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"> 
<html>
	<head> 
		<title>{{title}}</title> 
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8"> 
		<meta name="description" content="Node web server error page"> 
	</head> 
	<body>
		<p style="font-size: 120%; font-weight: bold;">{{error}}</p>
		{#submit}
		<p>Bonjour {name}!</p>
		{/submit}
		{^submit}
		<form method="get">
			<label for="name">Enter your name :</label>
			<input type="text" name="name" />
			<input type="submit" name="submit" />
		</form>
		{/submit}
	</body>
</html>
