# angularFramework
sample angular project framework

-----------------------
DECLARE 
	@vSQL				AS VARCHAR(MAX) = ''
	,@vAudtiScript		AS VARCHAR(MAX) = ''
	,@vTriggerScriptA	AS NVARCHAR(MAX) = ''
	,@vTriggerScriptB	AS NVARCHAR(MAX) = ''
	,@vTriggerScriptC	AS NVARCHAR(MAX) = ''
	,@vTriggerScriptD	AS NVARCHAR(MAX) = ''
	,@vTriggerScript	AS NVARCHAR(MAX) 
	,@vColumnsDef		AS VARCHAR(MAX) = ''
	,@vColumnsList		AS VARCHAR(MAX) = NULL
	,@vAuditColumnsList	AS VARCHAR(MAX) = NULL
	,@vSchema			AS VARCHAR(MAX) = 'GID'  
	,@vTableName		AS VARCHAR(200) = 'SUPPORT_DOCUMENT'
	,@vAuditTableName		AS VARCHAR(200) = '[GID].[GID.SUPPORT_DOCUMENT_AUDIT]'
	,@vAuditTriggerName		AS VARCHAR(200) = 'Gtr_Support_Document_Audit'
	,@vPrefix			AS VARCHAR(100) = ''
	,@vSuffix			AS VARCHAR(100) = ''
	

--SET @vSQL += 'CREATE TABLE [dbo].[' + @vAuditTableName + '] (' + CHAR(13)

IF(@vSchema IS NULL OR @vSchema = '')
	SET @vSchema = 'dbo'

SET @vSuffix = CHAR(13) 
SET @vPrefix = CHAR(13)






SET @vSuffix = CHAR(13) + CHAR(9)
SET @vPrefix = CHAR(13) + CHAR(9)
	
SELECT
	@vColumnsDef = COALESCE(@vColumnsDef + ',', '') 
		+ '[' 
		+ CAST(COLUMN_NAME AS VARCHAR) 
		+ '] [' 
		+ CASE UPPER(CAST(DATA_TYPE AS VARCHAR)) 
			WHEN 'DATE' THEN 'DATETIME'
			WHEN 'NTEXT' THEN 'NVARCHAR'
			ELSE UPPER(CAST(DATA_TYPE AS VARCHAR))
		END
		+ ']'
		+ CASE WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN ' (' + (CASE WHEN CHARACTER_MAXIMUM_LENGTH < 0 THEN 'MAX' ELSE CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) END) + ')' ELSE ' ' END
		+ ' NULL'
		+ @vSuffix
	
	--,ORDINAL_POSITION  
	--,COLUMN_NAME  
	--,DATA_TYPE  
	--,CHARACTER_MAXIMUM_LENGTH  
	--,IS_NULLABLE  
	--,COLUMN_DEFAULT
FROM     
	INFORMATION_SCHEMA.COLUMNS AS C 
WHERE     
	C.TABLE_NAME = REPLACE(@vTableName,'[dbo].','')
	AND C.TABLE_SCHEMA = @vSchema
ORDER BY   
	ORDINAL_POSITION ASC; 
	
	

SELECT 
	@vSQL += 'CREATE TABLE ' + @vAuditTableName + ' (' 
	,@vSQL += @vPrefix + '[ID] [INT] IDENTITY(1,1) NOT NULL'
	,@vSQL += @vPrefix + ',[OP] [CHAR](1) NULL'
	,@vSQL += @vPrefix + ',[SPID] [INT] NULL'
	,@vSQL += @vPrefix + ',[DB_LOGIN] [VARCHAR](50) NULL'
	,@vSQL += @vPrefix + ',[HOSTNAME] [VARCHAR](50) NULL'
	,@vSQL += @vPrefix + ',[LOG_DTM] [DATETIME] NULL' + @vSuffix  
	,@vSQL += @vColumnsDef 
	,@vSQL += ')'	

SET @vAudtiScript = @vSQL	

--============================
--==== Generate Trigger ====--
--============================

SET @vPrefix = CHAR(13)

SELECT 
	@vTriggerScriptA += 'CREATE TRIGGER [' + @vAuditTriggerName + '] ON ' + @vSchema + '.' +  @vTableName
	,@vTriggerScriptA += @vPrefix + 'FOR INSERT, UPDATE, DELETE'
	,@vTriggerScriptA += @vPrefix + 'AS'
	
SET @vPrefix = CHAR(13) + CHAR(9)
	
SELECT 
	@vTriggerScriptA += @vPrefix + 'IF (SELECT COUNT(*) FROM INSERTED) <> 0'
	,@vTriggerScriptA += @vPrefix + 'BEGIN'


SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9)

SELECT	
	@vTriggerScriptA += @vPrefix + 'IF (SELECT COUNT(*) FROM DELETED) <> 0' + char(9) + '/* UPDATE */'
	,@vTriggerScriptA += @vPrefix + 'BEGIN'




/* Inserting the Original Record */
SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) 

SELECT
	@vTriggerScriptA += @vPrefix + '--==== INSERT ORIGINAL RECORD ====--'	
	,@vTriggerScriptA += @vPrefix + 'INSERT INTO ' + @vAuditTableName + '('


--Generate Column List
SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) + CHAR(9)	
SET @vSuffix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) + CHAR(9)

SELECT
	@vAuditColumnsList = 'OP'
	,@vAuditColumnsList += @vPrefix + ',SPID'
	,@vAuditColumnsList += @vPrefix + ',DB_LOGIN'
	,@vAuditColumnsList += @vPrefix + ',HOSTNAME'
	,@vAuditColumnsList += @vPrefix +',LOG_DTM' + @vSuffix
	



SELECT
	@vColumnsList = COALESCE( @vColumnsList + @vSuffix ,'') 
	+ ',' + CAST(COLUMN_NAME AS VARCHAR)
FROM     
	INFORMATION_SCHEMA.COLUMNS AS C 
WHERE     
	C.TABLE_NAME = REPLACE(@vTableName,'[dbo].','')
	AND C.TABLE_SCHEMA = @vSchema
ORDER BY   
	ORDINAL_POSITION ASC;
	
SELECT	
	@vTriggerScriptA += @vPrefix + @vAuditColumnsList
	,@vTriggerScriptA += @vColumnsList
	
SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) 

SELECT	
	@vTriggerScriptA += @vPrefix + ')'	
	,@vTriggerScriptA += @vPrefix + 'SELECT'	
	
SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) + CHAR(9)
SET @vSuffix = CHAR(13)
SELECT	
	@vTriggerScriptA += @vPrefix + '''O'' AS OP'
	,@vTriggerScriptA += @vPrefix + ',@@SPID AS SPID'
	,@vTriggerScriptA += @vPrefix + ',SYSTEM_USER AS DB_LOGIN'
	,@vTriggerScriptA += @vPrefix + ',HOST_NAME() AS HOSTNAME'
	,@vTriggerScriptA += @vPrefix + ',GETDATE() AS LOG_DTM'
	,@vTriggerScriptA += @vPrefix + @vColumnsList

SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9)
	
SELECT	
	@vTriggerScriptA += @vPrefix + 'FROM DELETED' + @vSuffix + @vSuffix
	
---------------------------------End of Inserting the Original Record-------------------------------

/* Inserting Changed Record */

SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) 

SELECT	
	@vTriggerScriptB += @vPrefix + '--==== INSERT CHANGED RECORD ====--'
	,@vTriggerScriptB += @vPrefix + 'INSERT INTO ' + @vAuditTableName + '('


--Generate Column List
SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) + CHAR(9)	
SET @vSuffix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) + CHAR(9)

SELECT
	@vAuditColumnsList = 'OP'
	,@vAuditColumnsList += @vPrefix + ',SPID'
	,@vAuditColumnsList += @vPrefix + ',DB_LOGIN'
	,@vAuditColumnsList += @vPrefix + ',HOSTNAME'
	,@vAuditColumnsList += @vPrefix +',LOG_DTM' + @vSuffix
	
SET @vColumnsList = NULL

SELECT
	@vColumnsList = COALESCE( @vColumnsList + @vSuffix ,'') 
	+ ',' + CAST(COLUMN_NAME AS VARCHAR)
FROM     
	INFORMATION_SCHEMA.COLUMNS AS C 
WHERE     
	C.TABLE_NAME = REPLACE(@vTableName,'[dbo].','')
	AND C.TABLE_SCHEMA = @vSchema
ORDER BY   
	ORDINAL_POSITION ASC;
	
SELECT	
	@vTriggerScriptB += @vPrefix + @vAuditColumnsList
	,@vTriggerScriptB += @vColumnsList
	
SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) 

SELECT	
	@vTriggerScriptB += @vPrefix + ')'	
	,@vTriggerScriptB += @vPrefix + 'SELECT'	
	
SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) + CHAR(9)
SET @vSuffix = CHAR(13)
SELECT	
	@vTriggerScriptB += @vPrefix + '''U'' AS OP'
	,@vTriggerScriptB += @vPrefix + ',@@SPID AS SPID'
	,@vTriggerScriptB += @vPrefix + ',SYSTEM_USER AS DB_LOGIN'
	,@vTriggerScriptB += @vPrefix + ',HOST_NAME() AS HOSTNAME'
	,@vTriggerScriptB += @vPrefix + ',GETDATE() AS LOG_DTM'
	,@vTriggerScriptB += @vPrefix + @vColumnsList

SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9)
	
SELECT	
	@vTriggerScriptB += @vPrefix + 'FROM INSERTED' + @vSuffix + @vSuffix
	
---------------------------------End of Inserting Changed Record-------------------------------

SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9)

SELECT	
	@vTriggerScriptB += @vPrefix + 'END'
	,@vTriggerScriptC += @vPrefix + 'ELSE' + char(9) + '/* INSERT */'
	,@vTriggerScriptC += @vPrefix + 'BEGIN'


/* Inserting the New Record */
SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) 

SELECT
	@vTriggerScriptC += @vPrefix + '--==== INSERT NEW RECORD ====--'	
	,@vTriggerScriptC += @vPrefix + 'INSERT INTO ' + @vAuditTableName + '('


--Generate Column List
SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) + CHAR(9)	
SET @vSuffix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) + CHAR(9)

SELECT
	@vAuditColumnsList = 'OP'
	,@vAuditColumnsList += @vPrefix + ',SPID'
	,@vAuditColumnsList += @vPrefix + ',DB_LOGIN'
	,@vAuditColumnsList += @vPrefix + ',HOSTNAME'
	,@vAuditColumnsList += @vPrefix +',LOG_DTM' + @vSuffix
	

SET @vColumnsList = NULL

SELECT
	@vColumnsList = COALESCE( @vColumnsList + @vSuffix ,'') 
	+ ',' + CAST(COLUMN_NAME AS VARCHAR)
FROM     
	INFORMATION_SCHEMA.COLUMNS AS C 
WHERE     
	C.TABLE_NAME = REPLACE(@vTableName,'[dbo].','')
	AND C.TABLE_SCHEMA = @vSchema
ORDER BY   
	ORDINAL_POSITION ASC;
	
SELECT	
	@vTriggerScriptC += @vPrefix + @vAuditColumnsList
	,@vTriggerScriptC += @vColumnsList
	
SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) 

SELECT	
	@vTriggerScriptC += @vPrefix + ')'	
	,@vTriggerScriptC += @vPrefix + 'SELECT'	
	
SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) + CHAR(9)
SET @vSuffix = CHAR(13)

SELECT	
	@vTriggerScriptC += @vPrefix + '''I'' AS OP'
	,@vTriggerScriptC += @vPrefix + ',@@SPID AS SPID'
	,@vTriggerScriptC += @vPrefix + ',SYSTEM_USER AS DB_LOGIN'
	,@vTriggerScriptC += @vPrefix + ',HOST_NAME() AS HOSTNAME'
	,@vTriggerScriptC += @vPrefix + ',GETDATE() AS LOG_DTM'
	,@vTriggerScriptC += @vPrefix + @vColumnsList

SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9)
	
SELECT	
	@vTriggerScriptC += @vPrefix + 'FROM INSERTED' 
	
---------------------------------End of Inserting the New Record-------------------------------

SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) 

SELECT	
	@vTriggerScriptC += @vPrefix + 'END'
	
SET @vPrefix = CHAR(13) + CHAR(9) 

SELECT	
	@vTriggerScriptC += @vPrefix + 'END'	
	,@vTriggerScriptD += @vPrefix + 'ELSE' --+ char(9) + '/* DELETE */'
	,@vTriggerScriptD += @vPrefix + 'BEGIN'

SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) 
	
SELECT	
	@vTriggerScriptD += @vPrefix + 'IF (SELECT COUNT(*) FROM DELETED) <> 0' + char(9) + '/* DELETE */'
	,@vTriggerScriptD += @vPrefix + 'BEGIN'	
	
	
----

/* Inserting the Original Record */
SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) 

SELECT
	@vTriggerScriptD += @vPrefix + '--==== INSERT DELETED RECORD ====--'	
	,@vTriggerScriptD += @vPrefix + 'INSERT INTO ' + @vAuditTableName + '('


--Generate Column List
SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) + CHAR(9)	
SET @vSuffix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) + CHAR(9)

SELECT
	@vAuditColumnsList = 'OP'
	,@vAuditColumnsList += @vPrefix + ',SPID'
	,@vAuditColumnsList += @vPrefix + ',DB_LOGIN'
	,@vAuditColumnsList += @vPrefix + ',HOSTNAME'
	,@vAuditColumnsList += @vPrefix +',LOG_DTM' + @vSuffix
	

SET @vColumnsList = NULL

SELECT
	@vColumnsList = COALESCE( @vColumnsList + @vSuffix ,'') 
	+ ',' + CAST(COLUMN_NAME AS VARCHAR)
FROM     
	INFORMATION_SCHEMA.COLUMNS AS C 
WHERE     
	C.TABLE_NAME = REPLACE(@vTableName,'[dbo].','')
	AND C.TABLE_SCHEMA = @vSchema
ORDER BY   
	ORDINAL_POSITION ASC;
	
SELECT	
	@vTriggerScriptD += @vPrefix + @vAuditColumnsList
	,@vTriggerScriptD += @vColumnsList
	
SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) 

SELECT	
	@vTriggerScriptD += @vPrefix + ')'	
	,@vTriggerScriptD += @vPrefix + 'SELECT'	
	
SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9) + CHAR(9)
SET @vSuffix = CHAR(13)
SELECT	
	@vTriggerScriptD += @vPrefix + '''D'' AS OP'
	,@vTriggerScriptD += @vPrefix + ',@@SPID AS SPID'
	,@vTriggerScriptD += @vPrefix + ',SYSTEM_USER AS DB_LOGIN'
	,@vTriggerScriptD += @vPrefix + ',HOST_NAME() AS HOSTNAME'
	,@vTriggerScriptD += @vPrefix + ',GETDATE() AS LOG_DTM'
	,@vTriggerScriptD += @vPrefix + @vColumnsList

SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9) + CHAR(9)
	
SELECT	
	@vTriggerScriptD += @vPrefix + 'FROM DELETED' + @vSuffix + @vSuffix
	
---------------------------------End of Inserting the Deleted Record-------------------------------

SET @vPrefix = CHAR(13) + CHAR(9) + CHAR(9)

SELECT	
	@vTriggerScriptD += @vPrefix + 'END'

SET @vPrefix = CHAR(13) + CHAR(9) 

SELECT	
	@vTriggerScriptD += @vPrefix + 'END'


--SET  @vTriggerScript = (@vTriggerScriptA + @vTriggerScriptD)

--select len(@vTriggerScriptA)
--select len(@vTriggerScriptB)
--select len(@vTriggerScriptC)
--select len(@vTriggerScriptD)


--==== Audi Table ====--
--select @vAudtiScript

--==== Trigger ====--
select @vTriggerScriptA
select @vTriggerScriptB
select @vTriggerScriptC
select @vTriggerScriptD

---------------------------
