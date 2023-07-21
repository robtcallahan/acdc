<?php


// excel style array for the column heads
$styleArray = array(
	'font' => array(
		'bold' => true,
		),
	'alignment' => array(
		'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_LEFT,
		),
	'borders' => array(
		'allborders' => array(
			'style' => PHPExcel_Style_Border::BORDER_THIN,
			)
		),
	'fill' => array(
		'type' => PHPExcel_Style_Fill::FILL_SOLID,
		'startcolor' => array(
			'argb' => 'FFADD8E6',
			)
		),
	);

// array of letters for use as column names
$colNames = array('A','B','C','D','E','F','G','H','I','J','K','L');
$lastColName = $colNames[count($colNames)-1];

// Create new PHPExcel object
$excel = new PHPExcel();

// set the default styles 
$excel->setActiveSheetIndex(0);
$sheet = $excel->getActiveSheet();

// style the header row and columns
$sheet->getStyle("A1:" . $colNames[count($colNames)-1] . "1")->applyFromArray($headStyle);
for ($i=0; $i<count($colNames); $i++)
{
	$sheet->getColumnDimension($colNames[$i])->setAutoSize(true);
}


// arrays of headers and assocatiated property names
$heads = array("Location Name", "Project Name", "Est Install Date", "Business Service", "Cabinet Name", "Elevation", "Num RUs", "Asset Name", "Model", "Serial Number", "Asset Tag", "Reservation Date");
$fields = array("locationName", "projectName", "estimatedInstallDate", "businessService", "cabinetName", "elevation", "numRUs", "assetName", "model", "serialNumber", "assetTag", "reservationDate", );

// starting row; keeps track of the excel row we're writing out
$row = 1;

// write the column heads out
for ($i=0; $i<count($heads); $i++)
{
	$sheet->SetCellValue($colNames[$i] . $row, $heads[$i]);
}

for ($i=0; $i<count($grid); $i++)
{
	$g = $grid[$i];
	$row++;
	$sheet->getStyle("B{$row}:C{$row}")->applyFromArray($alignRight);
	writeRow($sheet, $g, $row);
}
