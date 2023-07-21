<?php
/*******************************************************************************
 *
 * $Id: global.php 62033 2012-04-09 14:06:07Z rcallaha $
 * $Date: 2012-04-09 14:06:07 +0000 (Mon, 09 Apr 2012) $
 * $Author: rcallaha $
 * $Revision: 62033 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/sns/trunk/php/global.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

// excel style array for the column heads
$styleArray = array(
    'font'      => array(
        'bold' => true,
    ),
    'alignment' => array(
        'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_LEFT,
    ),
    'borders'   => array(
        'allborders' => array(
            'style' => PHPExcel_Style_Border::BORDER_THIN,
        )
    ),
    'fill'      => array(
        'type'       => PHPExcel_Style_Fill::FILL_SOLID,
        'startcolor' => array(
            'argb' => 'FFADD8E6',
        )
    ),
);

// array of letters for use as column names
$colNames    = array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J');
$lastColName = $colNames[count($colNames) - 1];

try {
    // read the config file
    $config = $GLOBALS['config'];

    // array of records to export from the assetsGridPanel store
    $records = json_decode($_POST['json']);

    // Create new PHPExcel object
    $excel = new PHPExcel();

    // set the default styles
    $excel->setActiveSheetIndex(0);
    $sheet = $excel->getActiveSheet();

    // set all columns to autosize
    $sheet->getStyle("A1:{$lastColName}1")->applyFromArray($styleArray);
    for ($i = 0; $i < count($colNames); $i++) {
        $sheet->getColumnDimension($colNames[$i])->setAutoSize(true);
    }

    // arrays of headers and assocatiated property names
    $heads  = array("Exception", "Label", "Location", "Rack", "Serial Number", "Asset Tag", "Manufacturer", "Model", "Elevation", "Num RUs");
    $fields = array("exception", "label", "location", "cabinet", "serialNumber", "assetTag", "manufacturer", "model", "elevation", "numRUs");

    // write the column heads out
    for ($i = 0; $i < count($heads); $i++) {
        $sheet->SetCellValue($colNames[$i] . 1, $heads[$i]);
    }

    // set rack, serial number and asset tag columns to text format
    $sheet->getStyle('D2:D4000')->getNumberFormat()->setFormatCode(PHPExcel_Style_NumberFormat::FORMAT_TEXT);
    $sheet->getStyle('E2:E4000')->getNumberFormat()->setFormatCode(PHPExcel_Style_NumberFormat::FORMAT_TEXT);
    $sheet->getStyle('F2:F4000')->getNumberFormat()->setFormatCode(PHPExcel_Style_NumberFormat::FORMAT_TEXT);


    // excel row index; row 2 since the header row was output already
    $row = 2;

    foreach ($records as $r) {
        $data = array(
            "exception"       => $r->name,
            "label"           => $r->label,
            "location"        => $r->location,
            "cabinet"         => $r->cabinet,
            "serialNumber"    => $r->serialNumber,
            "assetTag"        => $r->assetTag,
            "manufacturer"    => $r->manufacturer,
            "model"           => $r->model,
            "elevation"       => $r->elevation,
            "numRUs"          => $r->numRUs,
            "state"           => $r->state
        );
        writeFields($sheet, $data, $row);
        $row++;
    }

    $dateStamp     = date('Y-m-d');
    $excelFileName = "ACDC Exceptions Export {$dateStamp}.xlsx";

    // Save Excel 2007 file
    $excelWriter = new PHPExcel_Writer_Excel2007($excel);
    $excelWriter->save("{$config->exportDir}/{$excelFileName}");

    $data = file_get_contents("{$config->exportDir}/{$excelFileName}");
    header("Pragma: public");
    header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
    header("Content-Type: application/ms-excel");
    header("Content-Length: " . (strlen($data) * 8));
    header('Content-Disposition: attachment; filename="' . $excelFileName . '"');

    // echo and exit
    echo $data;
} catch (Exception $e) {
    print "<pre>";
    printf("%-12s => %s\n", "returnCode", 1);
    printf("%-12s => %s\n", "errorCode", $e->getCode());
    printf("%-12s => %s\n", "errorText", $e->getMessage());
    printf("%-12s => %s\n", "errorFile", $e->getFile());
    printf("%-12s => %s\n", "errorLine", $e->getLine());
    printf("%-12s => \n%s\n", "errorStack", $e->getTraceAsString());
    print "</pre>";
}

function writeFields(PHPExcel_Worksheet &$sheet, $o, $row)
{
    global $fields, $colNames;

    $i = 0;
    foreach ($fields as $f) {
        if ($f == 'serialNumber') {
            // this is needed to insure that serial numbers are not put into exponential form and leading zeros are retained
            $sheet->getCell($colNames[$i] . $row)->setValueExplicit($o[$f], PHPExcel_Cell_DataType::TYPE_STRING);
        } else {
            $sheet->setCellValue($colNames[$i] . $row, $o[$f]);
        }
        $i++;
    }
}

