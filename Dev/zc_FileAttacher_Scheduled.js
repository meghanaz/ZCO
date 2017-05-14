/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Apr 2017     meghanaboddu
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
//added test comment
function zc_FileAttacher_ScheduledScript(type) {
	var columns = [];
	columns[columns.length] = new nlobjSearchColumn('custrecordzc_file_attacher_file_id');
	columns[columns.length] = new nlobjSearchColumn('custrecordzc_file_attacher_record_type');
	columns[columns.length] = new nlobjSearchColumn('custrecordzc_file_attacher_record_id');
	columns[columns.length] = new nlobjSearchColumn('custrecordzc_file_attached_processed');
	columns[columns.length] = new nlobjSearchColumn('custrecordzc_file_attacher_error');
	var filters = [];
	filters[filters.length] = new nlobjSearchFilter('custrecordzc_file_attached_processed',null,'is','F')
	var results = getAllResults('customrecordzc_file_attacher',null,filters, columns);
	if(results.length > 0){
		for(var i=0; i<results.length; i++){
			try{
				var context = nlapiGetContext();
				if (context.getRemainingUsage() <= 0 && (i+1) < results.length )
			      {
			         var status = nlapiScheduleScript(context.getScriptId(), context.getDeploymentId())
			         if (status == 'QUEUED')
			            break;     
			      }
				var FA_custrecid = results[i].getId();
				var FA_fileid = checkStr(results[i].getValue('custrecordzc_file_attacher_file_id'));
				var FA_dest_rectype = checkStr(results[i].getValue('custrecordzc_file_attacher_record_type'));
				var FA_dest_recid = checkStr(results[i].getValue('custrecordzc_file_attacher_record_id'));
				if(FA_fileid != '' && FA_dest_rectype != '' && FA_dest_recid != ''){
				nlapiAttachRecord('file', FA_fileid, FA_dest_rectype, FA_dest_recid, null);
				nlapiLogExecution('Debug','recordtype: '+FA_dest_rectype,'id: '+FA_dest_recid);
				nlapiSubmitField('customrecordzc_file_attacher',FA_custrecid,'custrecordzc_file_attached_processed','T');
				}
			}
			catch(error) 
			{
			   if (error.getDetails != undefined) 
			   {
				   nlapiLogExecution('ERROR', 'Process Error', error.getCode() + ': ' + error.getDetails());
				   nlapiSubmitField('customrecordzc_file_attacher',FA_custrecid,'custrecordzc_file_attacher_error',error.getDetails());
			   }
			   else
			   {
				   nlapiLogExecution('ERROR', 'Unexpected Error', error.toString());
				   nlapiSubmitField('customrecordzc_file_attacher',FA_custrecid,'custrecordzc_file_attacher_error',error.getDetails());
			   }
			}


		}
	}
	
}
//user defined function to get all the results of the search even when results are more than 1000
function getAllResults(stRecordType,stSavedSearch,arrFilters,arrColumns)
{
  var arrResult = [];
  var count = 1000;
  var init  = true;
  var min   = 0;
  var max   = 1000;  
  if(stSavedSearch)
  {
      var search = nlapiLoadSearch(stRecordType, stSavedSearch);
      if(arrFilters) search.addFilters(arrFilters);
      if(arrColumns) search.addColumns(arrColumns);
  }
  else
  {
      var search = nlapiCreateSearch(stRecordType, arrFilters, arrColumns);
  }
   var rs = search.runSearch();
  while (count == 1000 || init)
  {
      var resultSet = rs.getResults(min, max);
      arrResult = arrResult.concat(resultSet);
      min = max;
      max += 1000;

      init  = false;
	  if(resultSet)
		count = resultSet.length;
  }
  return arrResult;
}
function checkStr(valueStr)
{
	if(valueStr == null || valueStr == "" || valueStr == undefined)
		valueStr = '';
	return valueStr;
}
